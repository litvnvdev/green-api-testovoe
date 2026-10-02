import type { Credentials } from '../api/types';
import type { Chat, ChatMessage } from '../types';
import { readJson, removeItem, writeJson } from '../utils/storage';
import { emptyData, type ChatData } from './chatReducer';

const CREDENTIALS_KEY = 'greenApiChat:credentials';
/** История хранится отдельно для каждого инстанса, чтобы разные аккаунты не смешивались. */
const dataKey = (idInstance: string) => `greenApiChat:data:${idInstance}`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCredentials(value: unknown): value is Credentials {
  return (
    isRecord(value) &&
    typeof value.idInstance === 'string' &&
    typeof value.apiTokenInstance === 'string' &&
    typeof value.apiUrl === 'string'
  );
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

export function loadCredentials(): Credentials | null {
  return readJson(CREDENTIALS_KEY, isCredentials);
}

export function saveCredentials(credentials: Credentials): void {
  writeJson(CREDENTIALS_KEY, credentials);
}

export function clearCredentials(): void {
  removeItem(CREDENTIALS_KEY);
}

export function loadChatData(idInstance: string): ChatData {
  const data = readJson(dataKey(idInstance), isChatData);
  if (!data) return emptyData;
  // Отправка, прерванная перезагрузкой страницы, считается неудачной — её можно повторить.
  const messages: ChatData['messages'] = {};
  for (const [chatId, list] of Object.entries(data.messages)) {
    messages[chatId] = list.map((m) => (m.status === 'sending' ? { ...m, status: 'failed' } : m));
  }
  return { chats: data.chats, messages };
}

export function saveChatData(idInstance: string, data: ChatData): void {
  writeJson(dataKey(idInstance), data);
}
