import { readJson, writeJson } from '@/shared/lib';
import { emptyData } from './reducer';
import { chatDataSchema } from './schema';
import type { ChatData } from './types';

/** История хранится отдельно для каждого инстанса, чтобы разные аккаунты не смешивались. */
const dataKey = (instanceId: string) => `greenApiChat:data:${instanceId}`;

/**
 * Схема сохранённых данных: отправка, прерванная перезагрузкой страницы,
 * считается неудачной — её можно повторить.
 */
const storedChatDataSchema = chatDataSchema.transform(({ chats, messages }) => ({
  chats,
  messages: Object.fromEntries(
    Object.entries(messages).map(([chatId, list]) => [
      chatId,
      list.map((message) =>
        message.status === 'sending' ? { ...message, status: 'failed' as const } : message,
      ),
    ]),
  ),
}));

export function loadChatData(instanceId: string): ChatData {
  return readJson(dataKey(instanceId), storedChatDataSchema) ?? emptyData;
}

export function saveChatData(instanceId: string, data: ChatData): void {
  writeJson(dataKey(instanceId), data);
}
