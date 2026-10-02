import { z } from 'zod';
import { phoneSchema } from '@/shared/lib';

export const newChatSchema = z.object({ phone: phoneSchema });
