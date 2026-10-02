import { textMessageWebhookSchema } from './schemas';
import type { TextMessageEvent, WebhookBody } from './types';

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
