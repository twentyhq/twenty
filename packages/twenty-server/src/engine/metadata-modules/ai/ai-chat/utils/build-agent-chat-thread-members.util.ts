import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';

// The current sender comes first so a capped list always shows who is asking
export const buildAgentChatThreadMembers = ({
  thread,
  participantWorkspaceMemberIds,
  workspaceMemberById,
  currentWorkspaceMemberId,
}: {
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'workspaceMemberId'
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
  >;
  participantWorkspaceMemberIds: string[];
  workspaceMemberById: Partial<
    Record<string, Pick<FlatWorkspaceMember, 'name' | 'userEmail'>>
  >;
  currentWorkspaceMemberId: string;
}): AgentChatThreadMember[] => {
  const workspaceMemberIds = new Set(
    [
      currentWorkspaceMemberId,
      thread.workspaceMemberId,
      thread.directMessageFirstWorkspaceMemberId,
      thread.directMessageSecondWorkspaceMemberId,
      ...participantWorkspaceMemberIds,
    ].filter(isDefined),
  );

  return [...workspaceMemberIds].flatMap((workspaceMemberId) => {
    const workspaceMember = workspaceMemberById[workspaceMemberId];
    const name = isDefined(workspaceMember)
      ? getWorkspaceMemberNameOrEmail(workspaceMember)
      : null;

    return isNonEmptyString(name)
      ? [
          {
            workspaceMemberId,
            name,
            isCurrentSender: workspaceMemberId === currentWorkspaceMemberId,
          },
        ]
      : [];
  });
};
