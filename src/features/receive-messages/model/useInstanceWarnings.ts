import { useQuery } from '@tanstack/react-query';
import { getSettings, greenApiKeys, settingsWarnings, type Credentials } from '@/shared/api';

const NONE: string[] = [];

/**
 * Читает настройки инстанса и возвращает предупреждения, если входящие не будут попадать
 * в очередь. При возврате на вкладку запрос повторяется — исправленные в личном кабинете
 * настройки подхватятся без перезагрузки. Ошибки не критичны: о доступе сообщит polling.
 */
export function useInstanceWarnings(credentials: Credentials): string[] {
  // Токен намеренно не входит в ключ (ключи видны в кэше и devtools); инстанс однозначно
  // задаётся idInstance, а при смене кредов всё дерево пересоздаётся (key={idInstance}).
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data } = useQuery({
    queryKey: greenApiKeys.settings(credentials.idInstance),
    queryFn: ({ signal }) => getSettings(credentials, signal),
    select: settingsWarnings,
    // Даже свежие данные перезапрашиваем: пользователь мог уйти исправлять настройки.
    refetchOnWindowFocus: 'always',
  });
  return data ?? NONE;
}
