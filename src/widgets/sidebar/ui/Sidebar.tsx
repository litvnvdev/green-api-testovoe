import { useMemo, useState } from 'react';
import { ChatListItem, selectChatList, useChatStore } from '@/entities/chat';
import { LogoutButton } from '@/features/auth';
import { NewChatForm } from '@/features/create-chat';
import { ConnectionAlerts, ConnectionStatus } from '@/features/receive-messages';
import { IconButton, PlusIcon } from '@/shared/ui';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { data, activeChatId, actions } = useChatStore();
  const [creating, setCreating] = useState(false);
  const items = useMemo(() => selectChatList(data), [data]);

  return (
    <div className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Чаты</h1>
          <ConnectionStatus />
        </div>
        <IconButton
          label="Новый чат"
          icon={<PlusIcon />}
          onClick={() => setCreating((value) => !value)}
          aria-expanded={creating}
          aria-controls="new-chat-form"
        />
        <LogoutButton />
      </header>

      <ConnectionAlerts />

      {creating && <NewChatForm onDone={() => setCreating(false)} />}

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Пока нет чатов</p>
          {!creating && (
            <button type="button" className={styles.emptyButton} onClick={() => setCreating(true)}>
              Новый чат
            </button>
          )}
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((entry) => (
            <li key={entry.chat.id}>
              <ChatListItem
                {...entry}
                active={entry.chat.id === activeChatId}
                onSelect={actions.selectChat}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
