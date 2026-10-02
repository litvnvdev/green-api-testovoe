import { ChatBubbleIcon } from '@/shared/ui';
import styles from './ChatsPage.module.css';

/** Индексный маршрут «/»: чат ещё не выбран. */
export function ChatsPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <ChatBubbleIcon width={56} height={56} />
      <p>Выберите чат или создайте новый</p>
    </div>
  );
}
