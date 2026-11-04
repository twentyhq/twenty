import type z from 'zod';

import { type aiChatAssistantProfileSchema } from '@/ai/schemas/ai-chat-assistant-profile-schema';

export type AiChatAssistantProfile = z.infer<
  typeof aiChatAssistantProfileSchema
>;
