import type z from 'zod';

import { type getAiChatAssistantProfileSchema } from '@/ai/schemas/get-ai-chat-assistant-profile-schema';

export type AiChatAssistantProfile = z.infer<
  ReturnType<typeof getAiChatAssistantProfileSchema>
>;
