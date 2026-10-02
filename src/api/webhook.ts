import type { ChatMessage } from '../types';
import type { MessageData, MessageWebhook, WebhookBody } from './types';

const MESSAGE_WEBHOOKS: ReadonlySet<string> = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isMessageWebhook(body: WebhookBody): body is MessageWebhook {
  return (
    MESSAGE_WEBHOOKS.has(body.typeWebhook) &&
    typeof body.idMessage === 'string' &&
    typeof body.timestamp === 'number' &&
    isRecord(body.senderData) &&
    typeof body.senderData.chatId === 'string' &&
    isRecord(body.messageData)
  );
}

/** Достаёт текст из messageData или null, если сообщение не текстовое. */
export function extractText(data: MessageData): string | null {
  if (data.typeMessage === 'textMessage' && 'textMessageData' in data) {
    return data.textMessageData.textMessage;
  }
  if (data.typeMessage === 'extendedTextMessage' && 'extendedTextMessageData' in data) {
    return data.extendedTextMessageData.text;
  }
  return null;
}

export interface ParsedWebhookMessage {
  message: ChatMessage;
  /** Имя собеседника, если WhatsApp его прислал (только для входящих). */
  senderName?: string;
}

/**
 * Превращает тело уведомления в сообщение чата.
 * Возвращает null для всего, что мы не показываем: статусы, группы, медиа и т.п.
 */
export function parseWebhook(body: WebhookBody): ParsedWebhookMessage | null {
  if (!isMessageWebhook(body)) return null;

  const { chatId } = body.senderData;
  // Только личные чаты: группы (@g.us) вне объёма задания.
  if (!chatId.endsWith('@c.us')) return null;

  const text = extractText(body.messageData);
  if (text === null || text.trim() === '') return null;

  const direction = body.typeWebhook === 'incomingMessageReceived' ? 'in' : 'out';
  const senderName =
    direction === 'in'
      ? body.senderData.senderContactName || body.senderData.senderName || undefined
      : undefined;

  return {
    message: {
      id: body.idMessage,
      chatId,
      text,
      timestamp: body.timestamp * 1000,
      direction,
      status: 'sent',
    },
    senderName,
  };
}
