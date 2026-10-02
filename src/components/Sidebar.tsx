import { useMemo, useState } from 'react';
import { useChat } from '../context/ChatContext';
import type { PollingStatus } from '../hooks/usePolling';
import { formatListDate } from '../utils/format';
import { formatChatId } from '../utils/phone';
import { Avatar } from './Avatar';
import { LogoutIcon, PlusIcon } from './Icons';
import { NewChatForm } from './NewChatForm';
import styles from './Sidebar.module.css';

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

export function Sidebar() {
  const { state, polling, logout, selectChat } = useChat();
  const [creating, setCreating] = useState(false);
  const { chats, messages } = state.data;

  // Последнее сообщение каждого чата; сортировка — по последней активности.
  const items = useMemo(
    () =>
      chats
        .map((chat) => {
          const list = messages[chat.id] ?? [];
          const last = list[list.length - 1];
          return { chat, last, activity: last?.timestamp ?? chat.createdAt };
        })
        .sort((a, b) => b.activity - a.activity),
    [chats, messages],
  );

  return (
    <div className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Чаты</h1>
          <p className={styles.status} data-state={polling.state} role="status">
            {statusText(polling)}
          </p>
        </div>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setCreating((value) => !value)}
          aria-expanded={creating}
          aria-controls="new-chat-form"
          aria-label="Новый чат"
          title="Новый чат"
        >
          <PlusIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={logout}
          aria-label="Выйти"
          title={`Выйти (инстанс ${state.credentials?.idInstance ?? ''})`}
        >
          <LogoutIcon />
        </button>
      </header>

      {polling.state === 'error' && polling.fatal && (
        <div className={styles.fatal} role="alert">
          <p>Получение сообщений остановлено. Проверьте данные инстанса и войдите заново.</p>
          <button type="button" onClick={logout}>
            Войти заново
          </button>
        </div>
      )}

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
          {items.map(({ chat, last }) => {
            const phone = formatChatId(chat.id);
            const active = chat.id === state.activeChatId;
            return (
              <li key={chat.id}>
                <button
                  type="button"
                  className={styles.item}
                  data-active={active}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => selectChat(chat.id)}
                >
                  <Avatar id={chat.id} name={chat.name} />
                  <span className={styles.itemBody}>
                    <span className={styles.itemTop}>
                      <span className={styles.itemName}>{chat.name ?? phone}</span>
                      {last && (
                        <time
                          className={styles.itemTime}
                          dateTime={new Date(last.timestamp).toISOString()}
                        >
                          {formatListDate(last.timestamp)}
                        </time>
                      )}
                    </span>
                    <span className={styles.itemPreview}>
                      {last ? (
                        <>
                          {last.direction === 'out' && <span className={styles.you}>Вы: </span>}
                          {last.status === 'failed' ? 'Не отправлено' : last.text}
                        </>
                      ) : chat.name ? (
                        phone
                      ) : (
                        'Нет сообщений'
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
