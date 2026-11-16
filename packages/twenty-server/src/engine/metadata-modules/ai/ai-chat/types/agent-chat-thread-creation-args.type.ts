import { type AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatAssistantParticipationArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation-args.type';

export type AgentChatThreadCreationArgs = Omit<
  Parameters<AgentChatSharingService['createThread']>[0],
  'validateThread'
> &
  AgentChatAssistantParticipationArgs & {
    shouldApplyAssistantParticipation?: boolean;
    shouldValidateRecipients?: boolean;
    isReplyRequested?: boolean;
  };
