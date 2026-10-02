import type { TextMessageEvent } from '@/shared/api';
import type { ChatMessage } from './types';

let localCounter = 0;

/** Временный id до ответа sendMessage, чтобы показать сообщение сразу. */
export function createLocalId(): string {
  localCounter += 1;
  return `local-${Date.now()}-${localCounter}`;
}

export function createOutgoingMessage(chatId: string, text: string): ChatMessage {
  return {
    id: createLocalId(),
    chatId,
    text,
    timestamp: Date.now(),
    direction: 'out',
    status: 'sending',
  };
}

/** Сообщение из вебхука уже доставлено — статус sent. */
export function messageFromEvent({ senderName, ...event }: TextMessageEvent): ChatMessage {
  return { ...event, status: 'sent' };
}
