import { type AgentChatAssistantPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-assistant-policy.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export type AgentChatAssistantParticipation = {
  threadBefore: AgentChatThreadWorkspaceEntity;
  thread: AgentChatThreadWorkspaceEntity;
  isInitialMessage: boolean;
  assistantPolicy: Awaited<
    ReturnType<AgentChatAssistantPolicyService['resolve']>
  >;
};
