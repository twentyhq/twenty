import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxState,
  AgentChatThreadConversationType,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

// lastMentionedAt and lastActivityAt are stamped by separate writes of the same message
const MENTION_WINDOW_MS = 2_000;

export const getAgentChatPushNotificationReason = ({
  thread,
  participant,
  workspaceMemberId,
  inboxNotificationLevel,
}: {
  thread: Pick<
    AgentChatThreadWorkspaceEntity,
    | 'conversationType'
    | 'directMessageFirstWorkspaceMemberId'
    | 'directMessageSecondWorkspaceMemberId'
    | 'assigneeId'
    | 'lastActivityAt'
    | 'lastMessageSenderWorkspaceMemberId'
    | 'deletedAt'
  >;
  participant: AgentChatInboxState | undefined;
  workspaceMemberId: string;
  inboxNotificationLevel: string;
}): 'DIRECT_MESSAGE' | 'MENTION' | 'ASSIGNED' | 'FOLLOWED' | null => {
  const { lastActivityAt } = thread;

  if (
    inboxNotificationLevel === AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE ||
    isDefined(thread.deletedAt) ||
    !isDefined(lastActivityAt) ||
    thread.lastMessageSenderWorkspaceMemberId === workspaceMemberId
  ) {
    return null;
  }

  const { isUnread, isMentioned, scope } = getAgentChatThreadInboxStatus({
    lastActivityAt,
    participant,
  });

  if (isDefined(participant) && !isUnread) {
    return null;
  }

  if (
    thread.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE &&
    (thread.directMessageFirstWorkspaceMemberId === workspaceMemberId ||
      thread.directMessageSecondWorkspaceMemberId === workspaceMemberId)
  ) {
    return 'DIRECT_MESSAGE';
  }

  const lastMentionedAt = participant?.lastMentionedAt;

  if (
    isMentioned &&
    isDefined(lastMentionedAt) &&
    Math.abs(
      new Date(lastMentionedAt).getTime() - new Date(lastActivityAt).getTime(),
    ) <= MENTION_WINDOW_MS
  ) {
    return 'MENTION';
  }

  if (thread.assigneeId === workspaceMemberId) {
    return 'ASSIGNED';
  }

  return inboxNotificationLevel ===
    AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED && scope === 'INBOX'
    ? 'FOLLOWED'
    : null;
};
