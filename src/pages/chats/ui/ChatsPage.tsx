import { useChatStore } from '@/entities/chat';
import { ChatBubbleIcon } from '@/shared/ui';
import { ChatWindow } from '@/widgets/chat-window';
import { Sidebar } from '@/widgets/sidebar';
import styles from './ChatsPage.module.css';

export function ChatsPage() {
  const { data, activeChatId } = useChatStore();
  const activeChat = data.chats.find((chat) => chat.id === activeChatId);

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
