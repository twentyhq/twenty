import { z } from 'zod';

import { AI_CHAT_ASSISTANT_AVATAR_COLORS } from '@/ai/constants/ai-chat-assistant-avatar-colors.const';
import { AI_CHAT_ASSISTANT_AVATAR_FACES } from '@/ai/constants/ai-chat-assistant-avatar-faces.const';
import { AI_CHAT_ASSISTANT_AVATAR_SHAPES } from '@/ai/constants/ai-chat-assistant-avatar-shapes.const';
import { AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH } from '@/ai/constants/ai-chat-assistant-display-name-max-length.const';
import { isValidChatReferenceLabel } from '@/ai/utils/is-valid-chat-reference-label.util';

export const getAiChatAssistantProfileSchema = () =>
  z.object({
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH)
      .refine(isValidChatReferenceLabel),
    avatarShape: z.enum(AI_CHAT_ASSISTANT_AVATAR_SHAPES),
    avatarColor: z.enum(AI_CHAT_ASSISTANT_AVATAR_COLORS),
    avatarFace: z.enum(AI_CHAT_ASSISTANT_AVATAR_FACES),
    isAvatarAnimated: z.boolean(),
  });
