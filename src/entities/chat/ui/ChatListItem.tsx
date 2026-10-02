import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { formatChatId, formatListDate } from '@/shared/lib';
import { Avatar } from '@/shared/ui';
import { getChatTitle } from '../lib/title';
import type { ChatListEntry } from '../model/selectors';
import styles from './ChatListItem.module.css';

interface ChatListItemProps extends ChatListEntry {
  /** Адрес чата. Активность и aria-current="page" выставляет NavLink. */
  to: string;
}

export function ChatListItem({ chat, lastMessage, to }: ChatListItemProps) {
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
    <NavLink to={to} className={styles.item}>
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
    </NavLink>
  );
}
