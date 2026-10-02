import { createBrowserRouter, Navigate } from 'react-router';
import { ChatPage } from '@/pages/chat';
import { ChatsPage, ChatsPlaceholder } from '@/pages/chats';
import { LoginPage } from '@/pages/login';
import { ROUTES } from '@/shared/config';
import { AuthorizedArea } from './AuthorizedArea';
import { GuestOnly, RequireAuth } from './guards';

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: (
      <GuestOnly>
        <LoginPage />
      </GuestOnly>
    ),
  },
  {
    path: ROUTES.chats,
    element: (
      <RequireAuth>
        <AuthorizedArea>
          <ChatsPage />
        </AuthorizedArea>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <ChatsPlaceholder /> },
      { path: ROUTES.chat, element: <ChatPage /> },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.chats} replace /> },
]);
