/** Данные инстанса GREEN-API, которые вводит пользователь. */
export interface Credentials {
  idInstance: string;
  apiTokenInstance: string;
  /** Хост API инстанса, например https://7103.api.greenapi.com (виден в личном кабинете). */
  apiUrl: string;
}

// ---------- Ответы REST-методов ----------

export type InstanceState =
  'authorized' | 'notAuthorized' | 'blocked' | 'sleepMode' | 'starting' | 'yellowCard';

export interface GetStateInstanceResponse {
  stateInstance: InstanceState | string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

/** receiveNotification возвращает null, если очередь пуста. */
export interface Notification {
  receiptId: number;
  body: WebhookBody;
}

export interface DeleteNotificationResponse {
  result: boolean;
}

// ---------- Вебхуки ----------

export interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

export interface SenderData {
  chatId: string;
  sender: string;
  chatName?: string;
  senderName?: string;
  senderContactName?: string;
}

export interface TextMessageData {
  typeMessage: 'textMessage';
  textMessageData: { textMessage: string };
}

/** Текст со ссылкой/превью — так WhatsApp часто присылает сообщения с телефона. */
export interface ExtendedTextMessageData {
  typeMessage: 'extendedTextMessage';
  extendedTextMessageData: { text: string };
}

/** Любой другой тип (картинка, стикер, реакция...) — нам не интересен. */
export interface OtherMessageData {
  typeMessage: string;
}

export type MessageData = TextMessageData | ExtendedTextMessageData | OtherMessageData;

export type MessageWebhookType =
  'incomingMessageReceived' | 'outgoingMessageReceived' | 'outgoingAPIMessageReceived';

export interface MessageWebhook {
  typeWebhook: MessageWebhookType;
  instanceData: InstanceData;
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
}

/** Статусы, смена состояния инстанса и т.п. — игнорируем, но удаляем из очереди. */
export interface OtherWebhook {
  typeWebhook: string;
  [key: string]: unknown;
}

export type WebhookBody = MessageWebhook | OtherWebhook;
