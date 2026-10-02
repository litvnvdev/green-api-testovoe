import { useCallback, useMemo, type ReactNode } from 'react';
import { useChatActions } from '@/entities/chat';
import { messageFromEvent } from '@/entities/message';
import { useCredentials } from '@/entities/session';
import { parseWebhook, type WebhookBody } from '@/shared/api';
import { ReceiveMessagesContext, type ReceiveMessagesValue } from '../model/context';
import { useInstanceWarnings } from '../model/useInstanceWarnings';
import { usePolling } from '../model/usePolling';

/** Запускает получение уведомлений и кладёт текстовые сообщения в хранилище чатов. */
export function ReceiveMessagesProvider({ children }: { children: ReactNode }) {
  const credentials = useCredentials();
  const { receive } = useChatActions();

  const handleNotification = useCallback(
    (body: WebhookBody) => {
      const event = parseWebhook(body);
      if (event) receive(messageFromEvent(event), event.senderName);
    },
    [receive],
  );

  const status = usePolling(credentials, handleNotification);
  const warnings = useInstanceWarnings(credentials);

  const value = useMemo<ReceiveMessagesValue>(() => ({ status, warnings }), [status, warnings]);

  return (
    <ReceiveMessagesContext.Provider value={value}>{children}</ReceiveMessagesContext.Provider>
  );
}
