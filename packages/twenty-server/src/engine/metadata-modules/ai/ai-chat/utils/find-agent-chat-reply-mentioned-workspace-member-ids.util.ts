import { type AgentChatThreadMember } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-member.type';
import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';

// Only current members other than the sender, so a reply never shares the
// thread with someone new or notifies a made-up id
export const findAgentChatReplyMentionedWorkspaceMemberIds = ({
  replyText,
  members,
}: {
  replyText: string;
  members: Pick<
    AgentChatThreadMember,
    'workspaceMemberId' | 'isCurrentSender'
  >[];
}): string[] => {
  const mentionableWorkspaceMemberIds = new Set(
    members
      .filter(({ isCurrentSender }) => !isCurrentSender)
      .map(({ workspaceMemberId }) => workspaceMemberId),
  );

  return extractInboxMessageMentionedWorkspaceMemberIds(replyText).filter(
    (workspaceMemberId) => mentionableWorkspaceMemberIds.has(workspaceMemberId),
  );
};
