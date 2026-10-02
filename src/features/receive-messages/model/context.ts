import { createContext, useContext } from 'react';
import type { PollingStatus } from './usePolling';

export interface ReceiveMessagesValue {
  status: PollingStatus;
  /** Предупреждения о настройках инстанса, из-за которых входящие не придут. */
  warnings: string[];
}

export const ReceiveMessagesContext = createContext<ReceiveMessagesValue | null>(null);

export function useReceiveMessages(): ReceiveMessagesValue {
  const context = useContext(ReceiveMessagesContext);
  if (!context) {
    throw new Error('useReceiveMessages должен использоваться внутри ReceiveMessagesProvider');
  }
  return context;
}
