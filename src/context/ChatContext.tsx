import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { GreenApiError, sendMessage } from '../api/greenApi';
import type { Credentials, WebhookBody } from '../api/types';
import { parseWebhook } from '../api/webhook';
import { usePolling, type PollingStatus } from '../hooks/usePolling';
import type { ChatMessage } from '../types';
import { chatReducer, createInitialState, emptyData, type ChatState } from './chatReducer';
import {
  clearCredentials,
  loadChatData,
  loadCredentials,
  saveChatData,
  saveCredentials,
} from './persistence';

interface ChatContextValue {
  state: ChatState;
  polling: PollingStatus;
  login: (credentials: Credentials) => void;
  logout: () => void;
  openChat: (chatId: string) => void;
  selectChat: (chatId: string | null) => void;
  /** Отправляет текст в чат. Возвращает текст ошибки для показа пользователю или null. */
  send: (chatId: string, text: string) => Promise<string | null>;
  retry: (message: ChatMessage) => Promise<string | null>;
  /** Удаляет историю чата только в этом браузере (localStorage), не в WhatsApp. */
  clearChat: (chatId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function init(): ChatState {
  const credentials = loadCredentials();
  return createInitialState(
    credentials,
    credentials ? loadChatData(credentials.idInstance) : emptyData,
  );
}

let localCounter = 0;
const nextLocalId = () => `local-${Date.now()}-${++localCounter}`;

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, undefined, init);
  const { credentials, data } = state;

  // Креды нужны в асинхронных колбэках; ref избавляет от пересоздания колбэков.
  const credentialsRef = useRef(credentials);
  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  // Синхронизация истории с localStorage.
  useEffect(() => {
    if (credentials) saveChatData(credentials.idInstance, data);
  }, [credentials, data]);

  const handleNotification = useCallback((body: WebhookBody) => {
    const parsed = parseWebhook(body);
    if (parsed) dispatch({ type: 'receive', ...parsed });
  }, []);

  const polling = usePolling(credentials, handleNotification);

  const login = useCallback((next: Credentials) => {
    saveCredentials(next);
    dispatch({ type: 'login', credentials: next, data: loadChatData(next.idInstance) });
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    dispatch({ type: 'logout' });
  }, []);

  const openChat = useCallback((chatId: string) => dispatch({ type: 'openChat', chatId }), []);
  const clearChat = useCallback((chatId: string) => dispatch({ type: 'clearChat', chatId }), []);
  const selectChat = useCallback(
    (chatId: string | null) => dispatch({ type: 'selectChat', chatId }),
    [],
  );

  const deliver = useCallback(async (message: ChatMessage): Promise<string | null> => {
    const creds = credentialsRef.current;
    if (!creds) return 'Сессия завершена. Войдите снова.';
    try {
      const { idMessage } = await sendMessage(creds, message.chatId, message.text);
      dispatch({
        type: 'sendSuccess',
        chatId: message.chatId,
        localId: message.id,
        idMessage,
      });
      return null;
    } catch (error) {
      dispatch({ type: 'sendFailed', chatId: message.chatId, localId: message.id });
      return error instanceof GreenApiError ? error.message : 'Не удалось отправить сообщение.';
    }
  }, []);

  const send = useCallback(
    (chatId: string, text: string) => {
      const message: ChatMessage = {
        id: nextLocalId(),
        chatId,
        text,
        timestamp: Date.now(),
        direction: 'out',
        status: 'sending',
      };
      dispatch({ type: 'sendStart', message });
      return deliver(message);
    },
    [deliver],
  );

  const retry = useCallback(
    (message: ChatMessage) => {
      dispatch({ type: 'retry', chatId: message.chatId, localId: message.id });
      return deliver(message);
    },
    [deliver],
  );

  const value = useMemo<ChatContextValue>(
    () => ({ state, polling, login, logout, openChat, selectChat, send, retry, clearChat }),
    [state, polling, login, logout, openChat, selectChat, send, retry, clearChat],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat должен использоваться внутри ChatProvider');
  return context;
}
