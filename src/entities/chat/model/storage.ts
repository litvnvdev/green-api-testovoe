import type { ChatMessage } from '@/entities/message/@x/chat';
import { readJson, writeJson } from '@/shared/lib';
import { emptyData } from './reducer';
import type { Chat, ChatData } from './types';

/** История хранится отдельно для каждого инстанса, чтобы разные аккаунты не смешивались. */
const dataKey = (instanceId: string) => `greenApiChat:data:${instanceId}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isChat(value: unknown): value is Chat {
  return isRecord(value) && typeof value.id === 'string' && typeof value.createdAt === 'number';
}

function isMessage(value: unknown): value is ChatMessage {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.chatId === 'string' &&
    typeof value.text === 'string' &&
    typeof value.timestamp === 'number' &&
    (value.direction === 'in' || value.direction === 'out')
  );
}

function isChatData(value: unknown): value is ChatData {
  if (!isRecord(value) || !Array.isArray(value.chats) || !isRecord(value.messages)) return false;
  return (
    value.chats.every(isChat) &&
    Object.values(value.messages).every((list) => Array.isArray(list) && list.every(isMessage))
  );
}

export function loadChatData(instanceId: string): ChatData {
  const data = readJson(dataKey(instanceId), isChatData);
  if (!data) return emptyData;
  // Отправка, прерванная перезагрузкой страницы, считается неудачной — её можно повторить.
  const messages: ChatData['messages'] = {};
  for (const [chatId, list] of Object.entries(data.messages)) {
    messages[chatId] = list.map((m) => (m.status === 'sending' ? { ...m, status: 'failed' } : m));
  }
  return { chats: data.chats, messages };
}

export function saveChatData(instanceId: string, data: ChatData): void {
  writeJson(dataKey(instanceId), data);
}
