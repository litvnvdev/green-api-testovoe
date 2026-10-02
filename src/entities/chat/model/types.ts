import type { z } from 'zod';
import type { chatDataSchema, chatSchema } from './schema';

export type Chat = z.infer<typeof chatSchema>;
export type ChatData = z.output<typeof chatDataSchema>;
