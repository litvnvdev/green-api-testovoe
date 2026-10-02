import type { z } from 'zod';
import type { chatMessageSchema, messageStatusSchema } from './schema';

export type { MessageDirection } from '@/shared/api';

export type MessageStatus = z.infer<typeof messageStatusSchema>;
export type ChatMessage = z.output<typeof chatMessageSchema>;
