import { createContext, useContext } from 'react';
import type { Credentials } from '@/shared/api';

export interface SessionContextValue {
  credentials: Credentials | null;
  /** Сохраняет креды (уже проверенные через getStateInstance). */
  login: (credentials: Credentials) => void;
  /** Удаляет креды. История чатов инстанса остаётся в браузере. */
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession должен использоваться внутри SessionProvider');
  return context;
}

/** Креды внутри защищённой части приложения, где сессия гарантированно есть. */
export function useCredentials(): Credentials {
  const { credentials } = useSession();
  if (!credentials) throw new Error('useCredentials вызван без активной сессии');
  return credentials;
}
