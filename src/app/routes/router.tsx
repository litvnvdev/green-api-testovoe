import { createBrowserRouter, Navigate } from 'react-router';
import { ROUTES } from '@/shared/config';
import { PageLoader } from '@/shared/ui';
import { AuthorizedArea } from './AuthorizedArea';
import { GuestOnly, RequireAuth } from './guards';
import { RootLayout } from './RootLayout';

/**
 * Страницы грузятся лениво (отдельные чанки). Пока грузится первая — HydrateFallback,
 * при переходах — полоса прогресса в RootLayout.
 */
export const router = createBrowserRouter([
  {
    Component: RootLayout,
    HydrateFallback: PageLoader,
    children: [
      {
        Component: GuestOnly,
        children: [
          {
            path: ROUTES.login,
            lazy: async () => ({ Component: (await import('@/pages/login')).LoginPage }),
          },
        ],
      },
      {
        Component: RequireAuth,
        children: [
          {
            Component: AuthorizedArea,
            children: [
              {
                path: ROUTES.chats,
                lazy: async () => ({ Component: (await import('@/pages/chats')).ChatsPage }),
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (await import('@/pages/chats')).ChatsPlaceholder,
                    }),
                  },
                  {
                    path: ROUTES.chat,
                    lazy: async () => ({ Component: (await import('@/pages/chat')).ChatPage }),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <Navigate to={ROUTES.chats} replace /> },
    ],
  },
]);
