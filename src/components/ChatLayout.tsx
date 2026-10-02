import { useChat } from '../context/ChatContext';
import { ChatWindow } from './ChatWindow';
import styles from './ChatLayout.module.css';
import { ChatBubbleIcon } from './Icons';
import { Sidebar } from './Sidebar';

export function ChatLayout() {
  const { state } = useChat();
  const activeChat = state.data.chats.find((chat) => chat.id === state.activeChatId);

  return (
    // data-view переключает колонки на узких экранах: либо список, либо переписка.
    <div className={styles.layout} data-view={activeChat ? 'chat' : 'list'}>
      <aside className={styles.sidebar} aria-label="Список чатов">
        <Sidebar />
      </aside>
      <main className={styles.main}>
        {activeChat ? (
          <ChatWindow key={activeChat.id} chat={activeChat} />
        ) : (
          <div className={styles.placeholder}>
            <ChatBubbleIcon width={56} height={56} />
            <p>Выберите чат или создайте новый</p>
          </div>
        )}
      </main>
    </div>
  );
}
