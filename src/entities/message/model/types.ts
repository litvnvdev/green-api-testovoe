import type { TextMessageEvent } from '@/shared/api';

export type { MessageDirection } from '@/shared/api';

/** sending — ждём ответа sendMessage; failed — отправка не удалась. */
export type MessageStatus = 'sending' | 'sent' | 'failed';

/**
 * Сообщение в истории чата: событие из вебхука без служебного имени отправителя плюс статус доставки.
 * id — idMessage из GREEN-API, либо временный local-* до ответа sendMessage.
 */
export type ChatMessage = Omit<TextMessageEvent, 'senderName'> & {
  status: MessageStatus;
};
