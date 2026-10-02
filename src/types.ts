export type MessageDirection = 'in' | 'out';

/** sending — ждём ответа sendMessage; failed — отправка не удалась. */
export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface ChatMessage {
  /** idMessage из GREEN-API, либо временный local-* до ответа сервера. */
  id: string;
  chatId: string;
  text: string;
  /** Unix-время в миллисекундах. */
  timestamp: number;
  direction: MessageDirection;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  /** Имя из WhatsApp, если пришло во входящем сообщении. */
  name?: string;
  createdAt: number;
}
