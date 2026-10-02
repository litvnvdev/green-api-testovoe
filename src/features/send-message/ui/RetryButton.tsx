import type { ChatMessage } from '@/entities/message';
import styles from './RetryButton.module.css';

interface RetryButtonProps {
  message: ChatMessage;
  onRetry: (message: ChatMessage) => void;
}

/** Показывается только под неотправленным сообщением. */
export function RetryButton({ message, onRetry }: RetryButtonProps) {
  if (message.status !== 'failed') return null;
  return (
    <button type="button" className={styles.retry} onClick={() => onRetry(message)}>
      Не отправлено. Повторить
    </button>
  );
}
