import { Link, useParams } from 'react-router';
import { useChatActions, useChatStore } from '@/entities/chat';
import { ROUTES } from '@/shared/config';
import { formatChatId, phoneSchema, toChatId } from '@/shared/lib';
import { ChatWindow } from '@/widgets/chat-window';
import styles from './ChatPage.module.css';

/** /chat/:phone — переписка с номером из адреса. */
export function ChatPage() {
  const { phone = '' } = useParams();
  const { data } = useChatStore();
  const { addChat } = useChatActions();

  const parsed = phoneSchema.safeParse(phone);
  if (!parsed.success) {
    return (
      <div className={styles.state}>
        <p>Неверный номер в адресе.</p>
        <Link to={ROUTES.chats}>К списку чатов</Link>
      </div>
    );
  }

  const chatId = toChatId(parsed.data);
  const chat = data.chats.find((item) => item.id === chatId);

  if (!chat) {
    // Например, чат удалили или ссылку открыли в другом браузере.
    return (
      <div className={styles.state}>
        <p>Чата с номером {formatChatId(chatId)} нет в списке.</p>
        <button type="button" className={styles.primary} onClick={() => addChat(chatId)}>
          Создать чат
        </button>
        <Link to={ROUTES.chats}>К списку чатов</Link>
      </div>
    );
  }

  // key сбрасывает черновик и состояние окна при переходе между чатами.
  return <ChatWindow key={chat.id} chat={chat} />;
}
