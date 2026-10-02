import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from '@/shared/api';

/** Пустые и состоящие из пробелов сообщения не отправляются. */
export const messageFormSchema = z.object({
  text: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});
