import type { ReactNode } from 'react';
import { ChatStoreProvider } from '@/entities/chat';
import { useCredentials } from '@/entities/session';
import { ReceiveMessagesProvider } from '@/features/receive-messages';

/**
 * Всё, что живёт только при активной сессии. key={idInstance} пересоздаёт хранилище
 * при входе в другой инстанс, и его история загружается заново.
 */
export function AuthorizedArea({ children }: { children: ReactNode }) {
  const { idInstance } = useCredentials();
  return (
    <ChatStoreProvider key={idInstance} instanceId={idInstance}>
      <ReceiveMessagesProvider>{children}</ReceiveMessagesProvider>
    </ChatStoreProvider>
  );
}
