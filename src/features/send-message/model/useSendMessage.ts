import { useMutation } from '@tanstack/react-query';
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

  const mutation = useMutation({
    mutationFn: (message: ChatMessage) => sendMessage(credentials, message.chatId, message.text),
    onSuccess: ({ idMessage }, message) => sendSuccess(message.chatId, message.id, idMessage),
    onError: (_error, message) => sendFailed(message.chatId, message.id),
  });

  const send = (text: string) => {
    const message = createOutgoingMessage(chatId, text);
    sendStart(message);
    mutation.mutate(message);
  };

  const retry = (message: ChatMessage) => {
    markRetry(message.chatId, message.id);
    mutation.mutate(message);
  };

  const error = mutation.error
    ? mutation.error instanceof GreenApiError
      ? mutation.error.message
      : 'Не удалось отправить сообщение.'
    : null;

  return { send, retry, error, dismissError: mutation.reset };
}
