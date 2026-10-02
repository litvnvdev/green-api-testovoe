import type { z } from 'zod';
import type {
  credentialsSchema,
  getStateInstanceResponseSchema,
  instanceSettingsSchema,
  instanceStateSchema,
  messageDirectionSchema,
  notificationSchema,
  sendMessageResponseSchema,
  textMessageEventSchema,
  webhookBodySchema,
} from './schemas';

// Все типы выводятся из Zod-схем: валидация и типы не расходятся.

/** Креды после валидации (обрезанные пробелы, apiUrl без завершающего слэша). */
export type Credentials = z.output<typeof credentialsSchema>;
/** То, что вводит пользователь в форму, до валидации. */
export type CredentialsInput = z.input<typeof credentialsSchema>;

export type InstanceState = z.infer<typeof instanceStateSchema>;
export type GetStateInstanceResponse = z.infer<typeof getStateInstanceResponseSchema>;
export type InstanceSettings = z.output<typeof instanceSettingsSchema>;
export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>;

export type WebhookBody = z.infer<typeof webhookBodySchema>;
export type Notification = NonNullable<z.infer<typeof notificationSchema>>;

export type MessageDirection = z.infer<typeof messageDirectionSchema>;
export type TextMessageEvent = z.infer<typeof textMessageEventSchema>;
