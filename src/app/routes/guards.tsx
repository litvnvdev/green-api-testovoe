import { Navigate, Outlet, useLocation } from 'react-router';
import { useSession } from '@/entities/session';
import { ROUTES } from '@/shared/config';

interface FromState {
  from?: string;
}

/** Без сессии — на страницу входа, запомнив, куда шли. */
export function RequireAuth() {
  const { credentials } = useSession();
  const location = useLocation();
  if (!credentials) {
    const state: FromState = { from: location.pathname };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }
  return <Outlet />;
}

/** Страница входа только для гостей; после входа возвращаем туда, куда шли. */
export function GuestOnly() {
  const { credentials } = useSession();
  const location = useLocation();
  if (credentials) {
    const { from } = (location.state ?? {}) as FromState;
    return <Navigate to={from ?? ROUTES.chats} replace />;
  }
  return <Outlet />;
}
