import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/agent-chat-assistant-name.const';
import { type AiChatAssistantProfile } from '@/ai/types/AiChatAssistantProfile';

export const DEFAULT_AI_CHAT_ASSISTANT_PROFILE = {
  aiChatAssistantDisplayName: AGENT_CHAT_ASSISTANT_NAME,
  aiChatAssistantAvatarShape: 'circle',
  aiChatAssistantAvatarColor: 'blue',
  aiChatAssistantAvatarFace: 'default',
  isAiChatAssistantAvatarAnimated: true,
} as const satisfies AiChatAssistantProfile;
