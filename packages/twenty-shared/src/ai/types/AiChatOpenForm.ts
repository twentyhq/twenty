import type z from 'zod';

import { type aiChatOpenFormSchema } from '@/ai/schemas/ai-chat-open-form-schema';

export type AiChatOpenForm = z.infer<typeof aiChatOpenFormSchema>;
