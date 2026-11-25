import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/agent-chat-assistant-name.const';
import { type AiChatAssistantProfile } from '@/ai/types/AiChatAssistantProfile';

export const DEFAULT_AI_CHAT_ASSISTANT_PROFILE = {
  displayName: AGENT_CHAT_ASSISTANT_NAME,
  avatarShape: 'circle',
  avatarColor: 'blue',
  avatarFace: 'default',
  isAvatarAnimated: true,
} as const satisfies AiChatAssistantProfile;
