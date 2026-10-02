import { formatChatId } from '@/shared/lib';
import type { Chat } from '../model/types';

/** Имя из WhatsApp, а если его нет — номер в читаемом виде. */
export function getChatTitle(chat: Chat): string {
  return chat.name ?? formatChatId(chat.id);
}
