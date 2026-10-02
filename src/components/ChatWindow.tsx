import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '../context/ChatContext';
import type { Chat, ChatMessage } from '../types';
import { formatChatId } from '../utils/phone';
import { Avatar } from './Avatar';
import styles from './ChatWindow.module.css';
import { BackIcon, CloseIcon, EraseIcon, MoreIcon, TrashIcon } from './Icons';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  chat: Chat;
}

type PendingAction = 'clear' | 'delete';

const CONFIRM_TEXT: Record<PendingAction, { question: string; action: string }> = {
  clear: {
    question: 'Удалить историю этого чата на сайте? В WhatsApp сообщения останутся.',
    action: 'Очистить',
  },
  delete: {
    question:
      'Удалить чат из списка вместе с историей? В WhatsApp ничего не изменится, новое сообщение с этого номера вернёт чат.',
    action: 'Удалить',
  },
};

export function ChatWindow({ chat }: ChatWindowProps) {
  const { state, send, retry, selectChat, clearChat, deleteChat } = useChat();
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const messages = state.data.messages[chat.id] ?? [];
  const phone = formatChatId(chat.id);

  const handleSend = useCallback(
    async (text: string) => {
      setError(null);
      setError(await send(chat.id, text));
    },
    [send, chat.id],
  );

  // Меню закрывается по клику вне него и по Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  function choose(action: PendingAction) {
    setMenuOpen(false);
    setPending(action);
  }

  function confirm() {
    if (pending === 'clear') clearChat(chat.id);
    if (pending === 'delete') deleteChat(chat.id);
    setPending(null);
  }

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
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.headerButton}
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="chat-actions"
            aria-label="Действия с чатом"
            title="Действия с чатом"
          >
            <MoreIcon width={22} height={22} />
          </button>
          {menuOpen && (
            <ul id="chat-actions" className={styles.menu}>
              <li>
                <button
                  type="button"
                  onClick={() => choose('clear')}
                  disabled={messages.length === 0}
                  autoFocus
                >
                  <EraseIcon width={20} height={20} />
                  Очистить историю
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={styles.menuDanger}
                  onClick={() => choose('delete')}
                >
                  <TrashIcon width={20} height={20} />
                  Удалить чат
                </button>
              </li>
            </ul>
          )}
        </div>
      </header>

      {pending && (
        <div className={styles.confirm} role="alertdialog" aria-labelledby="chat-confirm-text">
          <p id="chat-confirm-text">{CONFIRM_TEXT[pending].question}</p>
          <div className={styles.confirmActions}>
            <button type="button" onClick={() => setPending(null)} autoFocus>
              Отмена
            </button>
            <button type="button" className={styles.danger} onClick={confirm}>
              {CONFIRM_TEXT[pending].action}
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
