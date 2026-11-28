import { isNonEmptyString } from '@sniptt/guards';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

import { type FlatWorkspaceMember } from 'src/engine/core-modules/user/types/flat-workspace-member.type';
import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';
import { getAgentChatThreadMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-member-ids.util';

export const buildAgentChatThreadMembers = ({
  thread,
  workspaceMemberById,
}: {
  thread: Parameters<typeof getAgentChatThreadMemberIds>[0];
  workspaceMemberById: Partial<
    Record<string, Pick<FlatWorkspaceMember, 'name' | 'userEmail'>>
  >;
}): AgentChatThreadMember[] =>
  getAgentChatThreadMemberIds(thread).flatMap((workspaceMemberId) => {
    const workspaceMember = workspaceMemberById[workspaceMemberId];
    const name = workspaceMember
      ? getWorkspaceMemberNameOrEmail(workspaceMember)
      : null;

    return isNonEmptyString(name) ? [{ workspaceMemberId, name }] : [];
  });
