import type { Credentials } from '../api/types';
import type { Chat, ChatMessage } from '../types';

/** Сколько сообщений храним на чат, чтобы не упереться в квоту localStorage (~5 МБ). */
export const MAX_MESSAGES_PER_CHAT = 500;

export interface ChatData {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
}

export interface ChatState {
  credentials: Credentials | null;
  data: ChatData;
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'login'; credentials: Credentials; data: ChatData }
  | { type: 'logout' }
  | { type: 'openChat'; chatId: string }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'receive'; message: ChatMessage; senderName?: string }
  | { type: 'sendStart'; message: ChatMessage }
  | { type: 'sendSuccess'; chatId: string; localId: string; idMessage: string }
  | { type: 'sendFailed'; chatId: string; localId: string }
  | { type: 'retry'; chatId: string; localId: string }
  | { type: 'clearChat'; chatId: string };

export const emptyData: ChatData = { chats: [], messages: {} };

export function createInitialState(credentials: Credentials | null, data: ChatData): ChatState {
  return { credentials, data, activeChatId: null };
}

function ensureChat(chats: Chat[], chatId: string, timestamp: number, name?: string): Chat[] {
  const existing = chats.find((chat) => chat.id === chatId);
  if (!existing) return [...chats, { id: chatId, name, createdAt: timestamp }];
  if (name && existing.name !== name) {
    return chats.map((chat) => (chat.id === chatId ? { ...chat, name } : chat));
  }
  return chats;
}

/** Добавляет сообщение с дедупликацией по id и сохранением порядка по времени. */
function insertMessage(list: ChatMessage[], message: ChatMessage): ChatMessage[] {
  if (list.some((item) => item.id === message.id)) return list;
  const next = [...list, message];
  const prev = list[list.length - 1];
  if (prev && prev.timestamp > message.timestamp) {
    next.sort((a, b) => a.timestamp - b.timestamp);
  }
  return next.length > MAX_MESSAGES_PER_CHAT ? next.slice(-MAX_MESSAGES_PER_CHAT) : next;
}

function updateChatMessages(
  data: ChatData,
  chatId: string,
  update: (list: ChatMessage[]) => ChatMessage[],
): ChatData {
  const list = data.messages[chatId] ?? [];
  const next = update(list);
  if (next === list) return data;
  return { ...data, messages: { ...data.messages, [chatId]: next } };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'login':
      return createInitialState(action.credentials, action.data);

    case 'logout':
      return createInitialState(null, emptyData);

    case 'openChat':
      return {
        ...state,
        activeChatId: action.chatId,
        data: {
          ...state.data,
          chats: ensureChat(state.data.chats, action.chatId, Date.now()),
        },
      };

    case 'clearChat': {
      // Только локальная история: в WhatsApp сообщения остаются. Сам чат в списке сохраняется.
      if (!state.data.messages[action.chatId]?.length) return state;
      const messages = Object.fromEntries(
        Object.entries(state.data.messages).filter(([id]) => id !== action.chatId),
      );
      return { ...state, data: { ...state.data, messages } };
    }

    case 'selectChat':
      return { ...state, activeChatId: action.chatId };

    case 'receive':
    case 'sendStart': {
      const { message } = action;
      const senderName = action.type === 'receive' ? action.senderName : undefined;
      const withMessage = updateChatMessages(state.data, message.chatId, (list) =>
        insertMessage(list, message),
      );
      const chats = ensureChat(withMessage.chats, message.chatId, message.timestamp, senderName);
      if (withMessage === state.data && chats === state.data.chats) return state;
      return { ...state, data: { ...withMessage, chats } };
    }

    case 'sendSuccess': {
      const data = updateChatMessages(state.data, action.chatId, (list) => {
        if (!list.some((item) => item.id === action.localId)) return list;
        // Вебхук outgoingAPIMessageReceived мог прийти раньше ответа sendMessage —
        // тогда сообщение уже есть под настоящим id, а локальную копию убираем.
        if (list.some((item) => item.id === action.idMessage)) {
          return list.filter((item) => item.id !== action.localId);
        }
        return list.map((item) =>
          item.id === action.localId
            ? { ...item, id: action.idMessage, status: 'sent' as const }
            : item,
        );
      });
      return data === state.data ? state : { ...state, data };
    }

    case 'sendFailed':
    case 'retry': {
      const status = action.type === 'retry' ? 'sending' : 'failed';
      const data = updateChatMessages(state.data, action.chatId, (list) =>
        list.some((item) => item.id === action.localId)
          ? list.map((item) => (item.id === action.localId ? { ...item, status } : item))
          : list,
      );
      return data === state.data ? state : { ...state, data };
    }
  }
}
