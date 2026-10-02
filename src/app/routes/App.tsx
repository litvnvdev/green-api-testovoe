import { SessionProvider, useSession } from '@/entities/session';
import { ChatsPage } from '@/pages/chats';
import { LoginPage } from '@/pages/login';
import { AuthorizedArea } from './AuthorizedArea';

function Screen() {
  const { credentials } = useSession();
  if (!credentials) return <LoginPage />;
  return (
    <AuthorizedArea>
      <ChatsPage />
    </AuthorizedArea>
  );
}

export function App() {
  return (
    <SessionProvider>
      <Screen />
    </SessionProvider>
  );
}
