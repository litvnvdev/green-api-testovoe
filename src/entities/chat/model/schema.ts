import { z } from 'zod';
import { chatMessageSchema } from '@/entities/message/@x/chat';

export const chatSchema = z.object({
  /** chatId WhatsApp, например 79001234567@c.us. */
  id: z.string(),
  /** Имя из WhatsApp, если пришло во входящем сообщении. */
  name: z.string().optional(),
  createdAt: z.number(),
});

/** Всё, что хранится по одному инстансу: список чатов и история по chatId. */
export const chatDataSchema = z.object({
  chats: z.array(chatSchema),
  messages: z.record(z.string(), z.array(chatMessageSchema)),
});
