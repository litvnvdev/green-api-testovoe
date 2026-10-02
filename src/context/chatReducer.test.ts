import { describe, expect, it } from 'vitest';
import type { ChatMessage } from '../types';
import { chatReducer, createInitialState, emptyData } from './chatReducer';

const creds = { idInstance: '1101000001', apiTokenInstance: 'token', apiUrl: 'https://x' };
const chatId = '79001234567@c.us';

function msg(overrides: Partial<ChatMessage>): ChatMessage {
  return {
    id: 'm1',
    chatId,
    text: 'Привет',
    timestamp: 1000,
    direction: 'in',
    status: 'sent',
    ...overrides,
  };
}

describe('chatReducer', () => {
  it('повторная доставка вебхука не дублирует сообщение', () => {
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, { type: 'receive', message: msg({}) });
    const again = chatReducer(state, { type: 'receive', message: msg({}) });
    expect(again).toBe(state);
    expect(again.data.messages[chatId]).toHaveLength(1);
  });

  it('входящее сообщение от нового номера создаёт чат с именем отправителя', () => {
    const state = chatReducer(createInitialState(creds, emptyData), {
      type: 'receive',
      message: msg({}),
      senderName: 'Иван',
    });
    expect(state.data.chats).toEqual([{ id: chatId, name: 'Иван', createdAt: 1000 }]);
  });

  it('sendSuccess заменяет локальный id на idMessage', () => {
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, {
      type: 'sendStart',
      message: msg({ id: 'local-1', direction: 'out', status: 'sending' }),
    });
    state = chatReducer(state, {
      type: 'sendSuccess',
      chatId,
      localId: 'local-1',
      idMessage: 'REAL',
    });
    expect(state.data.messages[chatId]).toEqual([msg({ id: 'REAL', direction: 'out' })]);
  });

  it('если вебхук о своём сообщении пришёл раньше ответа API — дубля нет', () => {
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, {
      type: 'sendStart',
      message: msg({ id: 'local-1', direction: 'out', status: 'sending', timestamp: 1000 }),
    });
    state = chatReducer(state, {
      type: 'receive',
      message: msg({ id: 'REAL', direction: 'out', timestamp: 1001 }),
    });
    state = chatReducer(state, {
      type: 'sendSuccess',
      chatId,
      localId: 'local-1',
      idMessage: 'REAL',
    });
    expect(state.data.messages[chatId]?.map((m) => m.id)).toEqual(['REAL']);
  });

  it('сообщения упорядочены по времени', () => {
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, { type: 'receive', message: msg({ id: 'b', timestamp: 2000 }) });
    state = chatReducer(state, { type: 'receive', message: msg({ id: 'a', timestamp: 1000 }) });
    expect(state.data.messages[chatId]?.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('clearChat удаляет только сообщения этого чата, чат остаётся в списке', () => {
    const other = '79007654321@c.us';
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, { type: 'receive', message: msg({}) });
    state = chatReducer(state, { type: 'receive', message: msg({ id: 'x', chatId: other }) });
    state = chatReducer(state, { type: 'clearChat', chatId });
    expect(state.data.messages[chatId]).toBeUndefined();
    expect(state.data.messages[other]).toHaveLength(1);
    expect(state.data.chats.map((c) => c.id)).toEqual([chatId, other]);
  });

  it('logout очищает креды и данные', () => {
    let state = createInitialState(creds, emptyData);
    state = chatReducer(state, { type: 'receive', message: msg({}) });
    state = chatReducer(state, { type: 'logout' });
    expect(state.credentials).toBeNull();
    expect(state.data).toEqual(emptyData);
  });
});
