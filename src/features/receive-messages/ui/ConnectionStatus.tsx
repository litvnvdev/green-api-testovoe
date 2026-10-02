import type { PollingStatus } from '../model/usePolling';
import { useReceiveMessages } from '../model/context';
import styles from './ConnectionStatus.module.css';

function statusText(status: PollingStatus): string {
  switch (status.state) {
    case 'idle':
    case 'connecting':
      return 'Подключение…';
    case 'online':
      return 'В сети';
    case 'error':
      return status.fatal ? 'Нет доступа к инстансу' : `${status.message} Переподключаемся…`;
  }
}

export function ConnectionStatus() {
  const { status } = useReceiveMessages();
  return (
    <p className={styles.status} data-state={status.state} role="status">
      {statusText(status)}
    </p>
  );
}
