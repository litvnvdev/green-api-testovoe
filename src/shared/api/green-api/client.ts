import type { z } from 'zod';
import {
  deleteNotificationResponseSchema,
  getStateInstanceResponseSchema,
  instanceSettingsSchema,
  notificationSchema,
  sendMessageResponseSchema,
} from './schemas';
import type { Credentials } from './types';

export const DEFAULT_API_URL = 'https://api.green-api.com';

export type GreenApiErrorKind = 'auth' | 'rateLimit' | 'quota' | 'network' | 'server' | 'aborted';

/** Ошибка с уже готовым текстом для пользователя. Креды в текст не попадают. */
export class GreenApiError extends Error {
  readonly kind: GreenApiErrorKind;
  readonly status?: number;

  constructor(kind: GreenApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'GreenApiError';
    this.kind = kind;
    this.status = status;
  }
}

function errorFromStatus(status: number): GreenApiError {
  if (status === 401 || status === 403) {
    return new GreenApiError(
      'auth',
      'Неверный idInstance или apiTokenInstance (либо инстанс удалён).',
      status,
    );
  }
  if (status === 429) {
    return new GreenApiError(
      'rateLimit',
      'Слишком много запросов к GREEN-API. Подождите немного.',
      status,
    );
  }
  if (status === 466) {
    return new GreenApiError(
      'quota',
      'Исчерпан лимит тарифа GREEN-API. На бесплатном тарифе можно писать только в разрешённые чаты.',
      status,
    );
  }
  if (status === 400) {
    return new GreenApiError('server', 'GREEN-API отклонил запрос (неверные данные).', status);
  }
  return new GreenApiError('server', `Ошибка сервера GREEN-API (${status}).`, status);
}

function buildUrl(creds: Credentials, method: string, suffix = ''): string {
  const base = creds.apiUrl.replace(/\/+$/, '');
  const id = encodeURIComponent(creds.idInstance);
  const token = encodeURIComponent(creds.apiTokenInstance);
  return `${base}/waInstance${id}/${method}/${token}${suffix}`;
}

/** Запрос с проверкой ответа по Zod-схеме: несовпадение формата — понятная ошибка, а не падение в UI. */
async function request<S extends z.ZodType>(
  url: string,
  init: RequestInit,
  schema: S,
): Promise<z.output<S>> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new GreenApiError('aborted', 'Запрос отменён.');
    }
    // CORS-ошибки и неверный хост тоже выглядят как сетевая ошибка.
    throw new GreenApiError('network', 'Нет связи с GREEN-API. Проверьте интернет и адрес apiUrl.');
  }

  if (!response.ok) throw errorFromStatus(response.status);

  // receiveNotification при пустой очереди отдаёт тело "null" (или пустое).
  const text = await response.text();
  let json: unknown;
  try {
    json = text.trim() === '' ? null : JSON.parse(text);
  } catch {
    throw new GreenApiError('server', 'GREEN-API вернул неожиданный ответ.', response.status);
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new GreenApiError(
      'server',
      'GREEN-API вернул ответ в неожиданном формате.',
      response.status,
    );
  }
  return parsed.data;
}

export function getStateInstance(creds: Credentials, signal?: AbortSignal) {
  return request(
    buildUrl(creds, 'getStateInstance'),
    { method: 'GET', signal },
    getStateInstanceResponseSchema,
  );
}

export function getSettings(creds: Credentials, signal?: AbortSignal) {
  return request(buildUrl(creds, 'getSettings'), { method: 'GET', signal }, instanceSettingsSchema);
}

export function sendMessage(
  creds: Credentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
) {
  return request(
    buildUrl(creds, 'sendMessage'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
      signal,
    },
    sendMessageResponseSchema,
  );
}

/** Long polling: сервер держит запрос до receiveTimeout секунд, если очередь пуста. */
export function receiveNotification(creds: Credentials, signal?: AbortSignal, receiveTimeout = 5) {
  return request(
    buildUrl(creds, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
    { method: 'GET', signal },
    notificationSchema,
  );
}

export function deleteNotification(creds: Credentials, receiptId: number, signal?: AbortSignal) {
  return request(
    buildUrl(creds, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE', signal },
    deleteNotificationResponseSchema,
  );
}
