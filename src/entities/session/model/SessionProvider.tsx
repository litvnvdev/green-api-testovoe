import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Credentials } from '@/shared/api';
import { SessionContext, type SessionContextValue } from './context';
import { clearCredentials, loadCredentials, saveCredentials } from './storage';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState(loadCredentials);

  const login = useCallback((next: Credentials) => {
    saveCredentials(next);
    setCredentials(next);
  }, []);

  const logout = useCallback(() => {
    clearCredentials();
    setCredentials(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({ credentials, login, logout }),
    [credentials, login, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
