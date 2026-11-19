import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const isAgentChatThreadDirectAssistantChat = (
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'conversationType'
    | 'isAssistantParticipant'
    | 'channelId'
    | 'workspaceMemberId'
    | 'writerWorkspaceMemberIds'
  >,
): boolean =>
  thread.conversationType === AgentChatThreadConversationType.STANDARD &&
  thread.isAssistantParticipant &&
  !isDefined(thread.channelId) &&
  (thread.writerWorkspaceMemberIds ?? []).every(
    (writerWorkspaceMemberId) =>
      writerWorkspaceMemberId === thread.workspaceMemberId,
  );
