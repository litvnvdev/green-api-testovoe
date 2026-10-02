import { z } from 'zod';
import { textMessageEventSchema } from '@/shared/api';

/**
 * sending — ждём ответа sendMessage; sent — принято WhatsApp; delivered — доставлено на телефон;
 * read — прочитано; failed — отправка не удалась.
 */
export const messageStatusSchema = z.enum(['sending', 'sent', 'delivered', 'read', 'failed']);

/**
 * Сообщение в истории чата: событие из вебхука без служебного имени отправителя плюс статус доставки.
 * id — idMessage из GREEN-API, либо временный local-* до ответа sendMessage.
 */
export const chatMessageSchema = textMessageEventSchema
  .omit({ senderName: true })
  .extend({ status: messageStatusSchema.default('sent') });
