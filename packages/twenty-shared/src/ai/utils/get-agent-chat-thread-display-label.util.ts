import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { getAgentChatDirectMessagePeerWorkspaceMemberIds } from '@/ai/utils/get-agent-chat-direct-message-peer-workspace-member-ids.util';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';
import { isDefined } from '@/utils/validation/isDefined';
import { getWorkspaceMemberNameOrEmail } from '@/workspace/utils/getWorkspaceMemberNameOrEmail';

export const getAgentChatThreadDisplayLabel = ({
  thread,
  currentWorkspaceMemberId,
  workspaceMembers,
  fallbackLabel,
  formerMemberLabel,
}: {
  thread:
    | {
        title: string | null;
        conversationType?: AgentChatThreadConversationType;
        directMessageFirstWorkspaceMemberId?: string | null;
        directMessageSecondWorkspaceMemberId?: string | null;
      }
    | null
    | undefined;
  currentWorkspaceMemberId: string | undefined;
  workspaceMembers: readonly {
    id: string;
    name: { firstName: string; lastName: string };
    userEmail: string | null;
  }[];
  fallbackLabel: string;
  formerMemberLabel: string;
}): string => {
  if (
    thread?.conversationType !== AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
    const title = thread?.title;

    return isNonEmptyString(title) ? title : fallbackLabel;
  }

  const peerWorkspaceMemberIds =
    getAgentChatDirectMessagePeerWorkspaceMemberIds({
      thread,
      currentWorkspaceMemberId,
    });

  if (!isNonEmptyArray(peerWorkspaceMemberIds)) {
    return formerMemberLabel;
  }

  return peerWorkspaceMemberIds
    .map((workspaceMemberId) => {
      const workspaceMember = workspaceMembers.find(
        ({ id }) => id === workspaceMemberId,
      );

      return isDefined(workspaceMember)
        ? (getWorkspaceMemberNameOrEmail(workspaceMember) ?? formerMemberLabel)
        : formerMemberLabel;
    })
    .join(', ');
};
