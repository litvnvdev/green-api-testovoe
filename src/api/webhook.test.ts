import { describe, expect, it } from 'vitest';
import type { WebhookBody } from './types';
import { parseWebhook } from './webhook';

const base = {
  instanceData: { idInstance: 1101000001, wid: '79990000000@c.us', typeInstance: 'whatsapp' },
  timestamp: 1700000000,
  idMessage: 'ABC123',
  senderData: {
    chatId: '79001234567@c.us',
    sender: '79001234567@c.us',
    senderName: 'Ivan',
    senderContactName: 'Иван',
  },
};

describe('parseWebhook', () => {
  it('разбирает входящее текстовое сообщение', () => {
    const body: WebhookBody = {
      ...base,
      typeWebhook: 'incomingMessageReceived',
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    };
    expect(parseWebhook(body)).toEqual({
      message: {
        id: 'ABC123',
        chatId: '79001234567@c.us',
        text: 'Привет',
        timestamp: 1700000000000,
        direction: 'in',
        status: 'sent',
      },
      senderName: 'Иван',
    });
  });

  it('разбирает extendedTextMessage', () => {
    const body: WebhookBody = {
      ...base,
      typeWebhook: 'incomingMessageReceived',
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'https://green-api.com' },
      },
    };
    expect(parseWebhook(body)?.message.text).toBe('https://green-api.com');
  });

  it('разбирает ответ на сообщение (quotedMessage)', () => {
    const body: WebhookBody = {
      ...base,
      typeWebhook: 'incomingMessageReceived',
      messageData: {
        typeMessage: 'quotedMessage',
        extendedTextMessageData: { text: 'Отвечаю на это', stanzaId: 'QUOTED1' },
      },
    };
    expect(parseWebhook(body)?.message.text).toBe('Отвечаю на это');
  });

  it('исходящие с телефона и из API помечаются как свои', () => {
    for (const typeWebhook of ['outgoingMessageReceived', 'outgoingAPIMessageReceived'] as const) {
      const body: WebhookBody = {
        ...base,
        typeWebhook,
        messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Ок' } },
      };
      const parsed = parseWebhook(body);
      expect(parsed?.message.direction).toBe('out');
      expect(parsed?.senderName).toBeUndefined();
    }
  });

  it('игнорирует нетекстовые сообщения', () => {
    const body: WebhookBody = {
      ...base,
      typeWebhook: 'incomingMessageReceived',
      messageData: { typeMessage: 'imageMessage' },
    };
    expect(parseWebhook(body)).toBeNull();
  });

  it('игнорирует групповые чаты', () => {
    const body: WebhookBody = {
      ...base,
      typeWebhook: 'incomingMessageReceived',
      senderData: { ...base.senderData, chatId: '120363000000000000@g.us' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Всем привет' } },
    };
    expect(parseWebhook(body)).toBeNull();
  });

  it('игнорирует прочие типы вебхуков', () => {
    expect(parseWebhook({ typeWebhook: 'outgoingMessageStatus', status: 'read' })).toBeNull();
    expect(
      parseWebhook({ typeWebhook: 'stateInstanceChanged', stateInstance: 'authorized' }),
    ).toBeNull();
  });

  it('не падает на битом теле', () => {
    expect(parseWebhook({ typeWebhook: 'incomingMessageReceived' })).toBeNull();
  });
});
