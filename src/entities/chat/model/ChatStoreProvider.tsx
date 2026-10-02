import { useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { ChatStoreContext, type ChatStoreActions, type ChatStoreValue } from './context';
import { chatReducer, createInitialState } from './reducer';
import { loadChatData, saveChatData } from './storage';

interface ChatStoreProviderProps {
  /** idInstance: ключ, под которым история хранится в localStorage. */
  instanceId: string;
  children: ReactNode;
}

/**
 * Хранилище чатов одного инстанса. При смене инстанса провайдер нужно пересоздать
 * (key={instanceId}), тогда история загрузится заново.
 */
export function ChatStoreProvider({ instanceId, children }: ChatStoreProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, instanceId, (id) =>
    createInitialState(loadChatData(id)),
  );

  // Синхронизация истории с localStorage.
  useEffect(() => {
    saveChatData(instanceId, state.data);
  }, [instanceId, state.data]);

  const actions = useMemo<ChatStoreActions>(
    () => ({
      addChat: (chatId) => dispatch({ type: 'addChat', chatId }),
      receive: (message, senderName) => dispatch({ type: 'receive', message, senderName }),
      sendStart: (message) => dispatch({ type: 'sendStart', message }),
      sendSuccess: (chatId, localId, idMessage) =>
        dispatch({ type: 'sendSuccess', chatId, localId, idMessage }),
      sendFailed: (chatId, localId) => dispatch({ type: 'sendFailed', chatId, localId }),
      retry: (chatId, localId) => dispatch({ type: 'retry', chatId, localId }),
      updateStatus: (chatId, id, status) => dispatch({ type: 'updateStatus', chatId, id, status }),
      clearChat: (chatId) => dispatch({ type: 'clearChat', chatId }),
      deleteChat: (chatId) => dispatch({ type: 'deleteChat', chatId }),
    }),
    [],
  );

  const value = useMemo<ChatStoreValue>(() => ({ ...state, actions }), [state, actions]);

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
}
