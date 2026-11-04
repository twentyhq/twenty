import { z } from 'zod';

import { AI_CHAT_ASSISTANT_AVATAR_COLORS } from '@/ai/constants/ai-chat-assistant-avatar-colors.const';
import { AI_CHAT_ASSISTANT_AVATAR_FACES } from '@/ai/constants/ai-chat-assistant-avatar-faces.const';
import { AI_CHAT_ASSISTANT_AVATAR_SHAPES } from '@/ai/constants/ai-chat-assistant-avatar-shapes.const';
import { AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH } from '@/ai/constants/ai-chat-assistant-display-name-max-length.const';

export const aiChatAssistantProfileSchema = z.object({
  aiChatAssistantDisplayName: z
    .string()
    .trim()
    .min(1)
    .max(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH),
  aiChatAssistantAvatarShape: z.enum(AI_CHAT_ASSISTANT_AVATAR_SHAPES),
  aiChatAssistantAvatarColor: z.enum(AI_CHAT_ASSISTANT_AVATAR_COLORS),
  aiChatAssistantAvatarFace: z.enum(AI_CHAT_ASSISTANT_AVATAR_FACES),
  isAiChatAssistantAvatarAnimated: z.boolean(),
});
