import type { ChatMessage } from '@/entities/message/@x/chat';
import type { Chat, ChatData } from './types';

export interface ChatListEntry {
  chat: Chat;
  lastMessage?: ChatMessage;
}

/** Чаты с последним сообщением, отсортированные по последней активности. */
export function selectChatList({ chats, messages }: ChatData): ChatListEntry[] {
  return chats
    .map((chat) => {
      const list = messages[chat.id] ?? [];
      const lastMessage = list[list.length - 1];
      return { chat, lastMessage, activity: lastMessage?.timestamp ?? chat.createdAt };
    })
    .sort((a, b) => b.activity - a.activity)
    .map(({ chat, lastMessage }) => ({ chat, lastMessage }));
}
