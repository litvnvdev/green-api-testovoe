import { useEffect, useState } from 'react';
import { getSettings, settingsWarnings, type Credentials } from '@/shared/api';

const NONE: string[] = [];

/**
 * Один раз после входа читает настройки инстанса и возвращает предупреждения,
 * если входящие сообщения не будут попадать в очередь. Ошибки запроса не критичны и игнорируются:
 * о проблемах с доступом сообщит polling.
 */
export function useInstanceWarnings(credentials: Credentials | null): string[] {
  const [result, setResult] = useState<{ owner: Credentials | null; warnings: string[] }>({
    owner: null,
    warnings: NONE,
  });

  useEffect(() => {
    if (!credentials) return;
    const controller = new AbortController();
    getSettings(credentials, controller.signal)
      .then((settings) => {
        if (!controller.signal.aborted) {
          setResult({ owner: credentials, warnings: settingsWarnings(settings) });
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [credentials]);

  return result.owner === credentials ? result.warnings : NONE;
}
