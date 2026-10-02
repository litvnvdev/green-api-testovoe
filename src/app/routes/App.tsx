import { RouterProvider } from 'react-router/dom';
import { SessionProvider } from '@/entities/session';
import { router } from './router';

export function App() {
  return (
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  );
}
