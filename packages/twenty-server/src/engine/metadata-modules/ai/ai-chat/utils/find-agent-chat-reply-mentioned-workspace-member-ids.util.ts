import {
  AgentChatThreadConversationType,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';
import { getAgentChatThreadMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-thread-member-ids.util';

export const findAgentChatReplyMentionedWorkspaceMemberIds = ({
  replyParts,
  thread,
  senderWorkspaceMemberId,
}: {
  replyParts: ExtendedUIMessagePart[];
  thread: Parameters<typeof getAgentChatThreadMemberIds>[0] &
    Pick<AgentChatThreadWorkspaceEntity, 'conversationType'>;
  senderWorkspaceMemberId: string;
}): string[] => {
  if (
    thread.conversationType === AgentChatThreadConversationType.DIRECT_MESSAGE
  ) {
    return [];
  }

  const memberIds = new Set(getAgentChatThreadMemberIds(thread));

  return extractInboxMessageMentionedWorkspaceMemberIds(
    replyParts
      .flatMap((part) => (part.type === 'text' ? [part.text] : []))
      .join('\n'),
  ).filter(
    (workspaceMemberId) =>
      workspaceMemberId !== senderWorkspaceMemberId &&
      memberIds.has(workspaceMemberId),
  );
};
