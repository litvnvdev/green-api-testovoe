import type { ChatMessage } from '@/entities/message/@x/chat';

export interface Chat {
  /** chatId WhatsApp, например 79001234567@c.us. */
  id: string;
  /** Имя из WhatsApp, если пришло во входящем сообщении. */
  name?: string;
  createdAt: number;
}

/** Всё, что хранится по одному инстансу: список чатов и история по chatId. */
export interface ChatData {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
}
