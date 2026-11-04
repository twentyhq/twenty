import { type AiChatAssistantProfile } from '@/ai/types/AiChatAssistantProfile';

export const DEFAULT_AI_CHAT_ASSISTANT_PROFILE = {
  aiChatAssistantDisplayName: 'Ada',
  aiChatAssistantAvatarShape: 'circle',
  aiChatAssistantAvatarColor: 'blue',
  aiChatAssistantAvatarFace: 'default',
  isAiChatAssistantAvatarAnimated: true,
} as const satisfies AiChatAssistantProfile;
