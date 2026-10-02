import { messageStatusWebhookSchema, textMessageWebhookSchema } from './schemas';
import type { MessageStatusEvent, TextMessageEvent, WebhookBody } from './types';

/**
 * Превращает тело уведомления в текстовое событие.
 * Возвращает null для всего, что мы не показываем: статусы, группы, медиа, пустой текст.
 */
export function parseWebhook(body: WebhookBody): TextMessageEvent | null {
  const parsed = textMessageWebhookSchema.safeParse(body);
  if (!parsed.success) return null;

  const { typeWebhook, idMessage, timestamp, senderData, messageData: text } = parsed.data;
  if (text.trim() === '') return null;

  const direction = typeWebhook === 'incomingMessageReceived' ? 'in' : 'out';
  return {
    id: idMessage,
    chatId: senderData.chatId,
    text,
    timestamp: timestamp * 1000,
    direction,
    senderName:
      direction === 'in'
        ? senderData.senderContactName || senderData.senderName || undefined
        : undefined,
  };
}

/** Статус отправленного сообщения (outgoingMessageStatus) или null для всех прочих вебхуков. */
export function parseStatusWebhook(body: WebhookBody): MessageStatusEvent | null {
  const parsed = messageStatusWebhookSchema.safeParse(body);
  if (!parsed.success) return null;
  const { idMessage, chatId, status } = parsed.data;
  return { id: idMessage, chatId, status };
}
