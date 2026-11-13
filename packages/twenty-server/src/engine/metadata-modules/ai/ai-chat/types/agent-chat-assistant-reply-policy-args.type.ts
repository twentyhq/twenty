import { type AgentChatAssistantParticipation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-assistant-participation.type';
import { type AgentChatMemberMessageActor } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-member-message-actor.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type AgentChatAssistantReplyPolicyArgs = {
  actor: Pick<AgentChatMemberMessageActor, 'workspaceId' | 'userWorkspaceId'>;
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    'id' | 'pendingQuestionMessageId'
  >;
  participation: Pick<AgentChatAssistantParticipation, 'replyDecision'>;
  isInboxEnabled: boolean;
  isDirectMessage: boolean;
  text: string;
};
