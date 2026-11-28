import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const getAgentChatThreadMemberIds = (
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'workspaceMemberId'
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
    | 'writerWorkspaceMemberIds'
  >,
): string[] => [
  ...new Set(
    [
      thread.workspaceMemberId,
      thread.directMessageFirstWorkspaceMemberId,
      thread.directMessageSecondWorkspaceMemberId,
      ...(thread.writerWorkspaceMemberIds ?? []),
    ].filter(isDefined),
  ),
];
