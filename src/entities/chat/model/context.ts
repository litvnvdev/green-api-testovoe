import { createContext, useContext } from 'react';
import type { ChatMessage } from '@/entities/message/@x/chat';
import type { ChatState } from './reducer';

export interface ChatStoreActions {
  /** Создаёт чат, если его ещё нет. Открывается он переходом на /chat/:phone. */
  addChat: (chatId: string) => void;
  /** Новое сообщение из вебхука; создаёт чат, если его нет. */
  receive: (message: ChatMessage, senderName?: string) => void;
  sendStart: (message: ChatMessage) => void;
  sendSuccess: (chatId: string, localId: string, idMessage: string) => void;
  sendFailed: (chatId: string, localId: string) => void;
  retry: (chatId: string, localId: string) => void;
  /** Только локальная история: в WhatsApp ничего не меняется. */
  clearChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
}

export interface ChatStoreValue extends ChatState {
  actions: ChatStoreActions;
}

export const ChatStoreContext = createContext<ChatStoreValue | null>(null);

export function useChatStore(): ChatStoreValue {
  const context = useContext(ChatStoreContext);
  if (!context) throw new Error('useChatStore должен использоваться внутри ChatStoreProvider');
  return context;
}

/** Только действия: их ссылка стабильна, компонент не перерисуется от новых сообщений. */
export function useChatActions(): ChatStoreActions {
  return useChatStore().actions;
}
