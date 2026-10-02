import { useCallback, useState } from 'react';
import { useChat } from '../context/ChatContext';
import type { Chat, ChatMessage } from '../types';
import { formatChatId } from '../utils/phone';
import { Avatar } from './Avatar';
import styles from './ChatWindow.module.css';
import { BackIcon, CloseIcon, TrashIcon } from './Icons';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  chat: Chat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { state, send, retry, selectChat, clearChat } = useChat();
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const messages = state.data.messages[chat.id] ?? [];
  const phone = formatChatId(chat.id);

  const handleSend = useCallback(
    async (text: string) => {
      setError(null);
      setError(await send(chat.id, text));
    },
    [send, chat.id],
  );

  const handleRetry = useCallback(
    async (message: ChatMessage) => {
      setError(null);
      setError(await retry(message));
    },
    [retry],
  );

  return (
    <section className={styles.window} aria-label={`Чат с ${chat.name ?? phone}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.back}
          onClick={() => selectChat(null)}
          aria-label="К списку чатов"
        >
          <BackIcon />
        </button>
        <Avatar id={chat.id} name={chat.name} size={40} />
        <div className={styles.headerText}>
          <h2 className={styles.name}>{chat.name ?? phone}</h2>
          <p className={styles.subtitle}>{chat.name ? phone : 'WhatsApp'}</p>
        </div>
        <button
          type="button"
          className={styles.headerButton}
          onClick={() => setConfirmingClear((value) => !value)}
          disabled={messages.length === 0}
          aria-expanded={confirmingClear}
          aria-controls="clear-chat-confirm"
          aria-label="Очистить историю"
          title="Очистить историю"
        >
          <TrashIcon width={22} height={22} />
        </button>
      </header>

      {confirmingClear && (
        <div
          id="clear-chat-confirm"
          className={styles.confirm}
          role="alertdialog"
          aria-labelledby="clear-chat-text"
        >
          <p id="clear-chat-text">
            Удалить историю этого чата на сайте? В WhatsApp сообщения останутся.
          </p>
          <div className={styles.confirmActions}>
            <button type="button" onClick={() => setConfirmingClear(false)} autoFocus>
              Отмена
            </button>
            <button
              type="button"
              className={styles.danger}
              onClick={() => {
                clearChat(chat.id);
                setConfirmingClear(false);
              }}
            >
              Очистить
            </button>
          </div>
        </div>
      )}

      <MessageList messages={messages} onRetry={handleRetry} />

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Скрыть ошибку">
            <CloseIcon width={18} height={18} />
          </button>
        </div>
      )}

      <MessageInput onSend={handleSend} />
    </section>
  );
}
