import { describe, expect, it } from 'vitest';
import { credentialsSchema, instanceSettingsSchema, notificationSchema } from './schemas';

describe('credentialsSchema', () => {
  it('обрезает пробелы и завершающий слэш apiUrl', () => {
    expect(
      credentialsSchema.parse({
        idInstance: ' 1101000001 ',
        apiTokenInstance: ' token ',
        apiUrl: 'https://7103.api.greenapi.com/',
      }),
    ).toEqual({
      idInstance: '1101000001',
      apiTokenInstance: 'token',
      apiUrl: 'https://7103.api.greenapi.com',
    });
  });

  it('отклоняет нецифровой idInstance, пустой токен и не-https адрес', () => {
    const result = credentialsSchema.safeParse({
      idInstance: 'abc',
      apiTokenInstance: '',
      apiUrl: 'http://api.green-api.com',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      'idInstance',
      'apiTokenInstance',
      'apiUrl',
    ]);
  });
});

describe('ответы API', () => {
  it('пустая очередь receiveNotification — null', () => {
    expect(notificationSchema.parse(null)).toBeNull();
  });

  it('уведомление без receiptId не проходит проверку', () => {
    expect(notificationSchema.safeParse({ body: { typeWebhook: 'x' } }).success).toBe(false);
  });

  it('webhookUrl: null в настройках превращается в пустую строку', () => {
    expect(instanceSettingsSchema.parse({ webhookUrl: null, incomingWebhook: 'yes' })).toEqual({
      webhookUrl: '',
      incomingWebhook: 'yes',
    });
  });
});
