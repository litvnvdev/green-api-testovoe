import { z } from 'zod';

// ---------- Данные инстанса ----------

/**
 * Креды инстанса. Одна схема используется в форме входа, при чтении сессии из localStorage
 * и как источник типа Credentials.
 */
export const credentialsSchema = z.object({
  idInstance: z.string().trim().regex(/^\d+$/, 'idInstance состоит только из цифр.'),
  apiTokenInstance: z.string().trim().min(1, 'Введите apiTokenInstance.'),
  /** Хост API инстанса, например https://7103.api.greenapi.com (виден в личном кабинете). */
  apiUrl: z
    .string()
    .trim()
    .pipe(
      z.url({
        protocol: /^https$/,
        hostname: z.regexes.domain,
        error: 'Нужен адрес вида https://api.green-api.com',
      }),
    )
    .transform((url) => url.replace(/\/+$/, '')),
});

// ---------- Ответы REST-методов ----------

export const instanceStateSchema = z.enum([
  'authorized',
  'notAuthorized',
  'blocked',
  'sleepMode',
  'starting',
  'yellowCard',
]);

export const getStateInstanceResponseSchema = z.object({
  // Неизвестное состояние не ломает вход: покажем его как есть.
  stateInstance: z.union([instanceStateSchema, z.string()]),
});

/** Часть ответа getSettings, которая влияет на получение сообщений. */
export const instanceSettingsSchema = z.object({
  webhookUrl: z
    .string()
    .nullish()
    .transform((value) => value ?? ''),
  incomingWebhook: z.string(),
  /** Статусы отправленных сообщений: доставлено / прочитано. */
  outgoingWebhook: z.string().optional(),
  outgoingMessageWebhook: z.string().optional(),
  outgoingAPIMessageWebhook: z.string().optional(),
});

/** Максимальная длина текста в sendMessage. */
export const MAX_MESSAGE_LENGTH = 20_000;

export const sendMessageResponseSchema = z.object({ idMessage: z.string() });

export const deleteNotificationResponseSchema = z.object({ result: z.boolean() });

// ---------- Вебхуки ----------

/** Тело уведомления: проверяем только тип, остальное разбирает parseWebhook. */
export const webhookBodySchema = z.looseObject({ typeWebhook: z.string() });

/** receiveNotification возвращает null, если очередь пуста. */
export const notificationSchema = z
  .object({ receiptId: z.number(), body: webhookBodySchema })
  .nullable();

export const messageWebhookTypeSchema = z.enum([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
]);

/**
 * Текст из messageData. textMessage — обычный текст; extendedTextMessage — текст со ссылкой;
 * quotedMessage — ответ на сообщение («Ответить»). Остальные типы (медиа, реакции) не подходят.
 */
const textFromMessageDataSchema = z.union([
  z
    .object({
      typeMessage: z.literal('textMessage'),
      textMessageData: z.object({ textMessage: z.string() }),
    })
    .transform((data) => data.textMessageData.textMessage),
  z
    .object({
      typeMessage: z.enum(['extendedTextMessage', 'quotedMessage']),
      extendedTextMessageData: z.object({ text: z.string() }),
    })
    .transform((data) => data.extendedTextMessageData.text),
]);

/** Текстовое сообщение в личном чате (группы @g.us вне объёма задания). */
export const textMessageWebhookSchema = z.object({
  typeWebhook: messageWebhookTypeSchema,
  idMessage: z.string(),
  timestamp: z.number(),
  senderData: z.object({
    chatId: z.string().endsWith('@c.us'),
    senderName: z.string().optional(),
    senderContactName: z.string().optional(),
  }),
  messageData: textFromMessageDataSchema,
});

/**
 * Статус доставки исходящего сообщения. Отказы WhatsApp сводим к failed:
 * для пользователя это одно и то же — «не отправлено».
 */
export const deliveryStatusSchema = z
  .enum([
    'sent',
    'delivered',
    'read',
    'failed',
    'noAccount',
    'notInGroup',
    'yellowCard',
    'suspended',
  ])
  .transform((status) =>
    status === 'sent' || status === 'delivered' || status === 'read' ? status : 'failed',
  );

export const messageStatusWebhookSchema = z.object({
  typeWebhook: z.literal('outgoingMessageStatus'),
  chatId: z.string().endsWith('@c.us'),
  /** Тот же idMessage, что вернул sendMessage. */
  idMessage: z.string(),
  status: deliveryStatusSchema,
});

// ---------- Результат разбора вебхука ----------

/** in — пришло от собеседника, out — отправлено с этого аккаунта (из API или с телефона). */
export const messageDirectionSchema = z.enum(['in', 'out']);

/** Изменение статуса отправленного сообщения. */
export const messageStatusEventSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
});

/** Текстовое сообщение, извлечённое из вебхука. Основа для доменной схемы сообщения. */
export const textMessageEventSchema = z.object({
  /** idMessage из WhatsApp. */
  id: z.string(),
  chatId: z.string(),
  text: z.string(),
  /** Unix-время в миллисекундах. */
  timestamp: z.number(),
  direction: messageDirectionSchema,
  /** Имя собеседника, если WhatsApp его прислал (только для входящих). */
  senderName: z.string().optional(),
});
