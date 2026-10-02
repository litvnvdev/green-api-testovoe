import { useNavigate } from 'react-router';
import { getChatTitle, useChatStore, type Chat } from '@/entities/chat';
import { MessageList } from '@/entities/message';
import { ChatActions } from '@/features/manage-chat';
import { MessageInput, RetryButton, useSendMessage } from '@/features/send-message';
import { ROUTES } from '@/shared/config';
import { formatChatId } from '@/shared/lib';
import { Avatar, BackIcon, CloseIcon, IconButton } from '@/shared/ui';
import styles from './ChatWindow.module.css';

interface ChatWindowProps {
  chat: Chat;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { data } = useChatStore();
  const navigate = useNavigate();
  const { send, retry, error, dismissError } = useSendMessage(chat.id);
  const messages = data.messages[chat.id] ?? [];
  const title = getChatTitle(chat);

  return (
    <section className={styles.window} aria-label={`Чат с ${title}`}>
      <header className={styles.header}>
        <IconButton
          className={styles.back}
          tone="accent"
          label="К списку чатов"
          icon={<BackIcon />}
          onClick={() => navigate(ROUTES.chats)}
        />
        <Avatar id={chat.id} name={chat.name} size={40} />
        <div className={styles.headerText}>
          <h2 className={styles.name}>{title}</h2>
          <p className={styles.subtitle}>{chat.name ? formatChatId(chat.id) : 'WhatsApp'}</p>
        </div>
        <ChatActions
          chatId={chat.id}
          hasMessages={messages.length > 0}
          onDeleted={() => navigate(ROUTES.chats, { replace: true })}
        />
      </header>

      <MessageList
        messages={messages}
        renderFooter={(message) => <RetryButton message={message} onRetry={retry} />}
      />

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" onClick={dismissError} aria-label="Скрыть ошибку">
            <CloseIcon width={18} height={18} />
          </button>
        </div>
      )}

      <MessageInput onSend={send} />
    </section>
  );
}
