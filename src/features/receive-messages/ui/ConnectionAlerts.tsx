import { useSession } from '@/entities/session';
import { GREEN_API_CONSOLE_URL } from '@/shared/config';
import { useReceiveMessages } from '../model/context';
import styles from './ConnectionAlerts.module.css';

/** Блокирующая ошибка доступа и предупреждения о настройках инстанса. */
export function ConnectionAlerts() {
  const { status, warnings } = useReceiveMessages();
  const { logout } = useSession();

  return (
    <>
      {status.state === 'error' && status.fatal && (
        <div className={styles.fatal} role="alert">
          <p>Получение сообщений остановлено. Проверьте данные инстанса и войдите заново.</p>
          <button type="button" onClick={logout}>
            Войти заново
          </button>
        </div>
      )}

      {warnings.length > 0 && (
        <div className={styles.warning} role="alert">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
          <p>
            Исправьте в{' '}
            <a href={GREEN_API_CONSOLE_URL} target="_blank" rel="noreferrer">
              личном кабинете
            </a>{' '}
            → инстанс → «Настройки». Изменения применяются в течение нескольких минут.
          </p>
        </div>
      )}
    </>
  );
}
