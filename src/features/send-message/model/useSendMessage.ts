import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatActions } from '@/entities/chat';
import { createOutgoingMessage, type ChatMessage } from '@/entities/message';
import { useCredentials } from '@/entities/session';
import { GreenApiError, sendMessage } from '@/shared/api';

/**
 * Отправка с оптимистичным показом: сообщение сразу появляется со статусом sending,
 * после ответа API получает настоящий idMessage или статус failed.
 */
export function useSendMessage(chatId: string) {
  const credentials = useCredentials();
  const { sendStart, sendSuccess, sendFailed, retry: markRetry } = useChatActions();
  const [error, setError] = useState<string | null>(null);

  // Креды нужны в асинхронном колбэке; ref избавляет от его пересоздания.
  const credentialsRef = useRef(credentials);
  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  const deliver = useCallback(
    async (message: ChatMessage) => {
      setError(null);
      try {
        const { idMessage } = await sendMessage(
          credentialsRef.current,
          message.chatId,
          message.text,
        );
        sendSuccess(message.chatId, message.id, idMessage);
      } catch (cause) {
        sendFailed(message.chatId, message.id);
        setError(
          cause instanceof GreenApiError ? cause.message : 'Не удалось отправить сообщение.',
        );
      }
    },
    [sendSuccess, sendFailed],
  );

  const send = useCallback(
    (text: string) => {
      const message = createOutgoingMessage(chatId, text);
      sendStart(message);
      return deliver(message);
    },
    [chatId, sendStart, deliver],
  );

  const retry = useCallback(
    (message: ChatMessage) => {
      markRetry(message.chatId, message.id);
      return deliver(message);
    },
    [markRetry, deliver],
  );

  const dismissError = useCallback(() => setError(null), []);

  return { send, retry, error, dismissError };
}
