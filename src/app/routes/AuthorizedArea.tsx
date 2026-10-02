import { Outlet } from 'react-router';
import { ChatStoreProvider } from '@/entities/chat';
import { useCredentials } from '@/entities/session';
import { ReceiveMessagesProvider } from '@/features/receive-messages';

/**
 * Всё, что живёт только при активной сессии. key={idInstance} пересоздаёт хранилище
 * при входе в другой инстанс, и его история загружается заново.
 */
export function AuthorizedArea() {
  const { idInstance } = useCredentials();
  return (
    <ChatStoreProvider key={idInstance} instanceId={idInstance}>
      <ReceiveMessagesProvider>
        <Outlet />
      </ReceiveMessagesProvider>
    </ChatStoreProvider>
  );
}
