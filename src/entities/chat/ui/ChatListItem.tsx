import type { ReactNode } from 'react';
import { formatChatId, formatListDate } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { getChatTitle } from '../lib/title';
import type { ChatListEntry } from '../model/selectors';
import styles from './ChatListItem.module.css';

interface ChatListItemProps extends ChatListEntry {
  active: boolean;
  onSelect: (chatId: string) => void;
}

export function ChatListItem({ chat, lastMessage, active, onSelect }: ChatListItemProps) {
  const phone = formatChatId(chat.id);

  let preview: ReactNode;
  if (lastMessage) {
    preview = (
      <>
        {lastMessage.direction === 'out' && <span className={styles.you}>Вы: </span>}
        {lastMessage.status === 'failed' ? 'Не отправлено' : lastMessage.text}
      </>
    );
  } else {
    preview = chat.name ? phone : 'Нет сообщений';
  }

  return (
    <button
      type="button"
      className={styles.item}
      data-active={active}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect(chat.id)}
    >
      <Avatar id={chat.id} name={chat.name} />
      <span className={styles.itemBody}>
        <span className={styles.itemTop}>
          <span className={styles.itemName}>{getChatTitle(chat)}</span>
          {lastMessage && (
            <time
              className={styles.itemTime}
              dateTime={new Date(lastMessage.timestamp).toISOString()}
            >
              {formatListDate(lastMessage.timestamp)}
            </time>
          )}
        </span>
        <span className={styles.itemPreview}>{preview}</span>
      </span>
    </button>
  );
}
