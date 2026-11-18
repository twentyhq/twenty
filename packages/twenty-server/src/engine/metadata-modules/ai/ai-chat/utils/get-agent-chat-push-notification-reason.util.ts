import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxState,
  AgentChatThreadConversationType,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_PUSH_NOTIFICATION_MENTION_WINDOW_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-push-notification-mention-window-ms.constant';
import { type AgentChatPushNotificationReason } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-push-notification-reason.type';
import { type AgentChatPushNotificationThread } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-push-notification-thread.type';

export const getAgentChatPushNotificationReason = ({
  thread,
  participant,
  workspaceMemberId,
  inboxNotificationLevel,
}: {
  thread: Omit<
    AgentChatPushNotificationThread,
    'id' | 'title' | 'lastMessageText'
  >;
  participant: AgentChatInboxState | undefined;
  workspaceMemberId: string;
  inboxNotificationLevel: string;
}): AgentChatPushNotificationReason | null => {
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
    ) <= AGENT_CHAT_PUSH_NOTIFICATION_MENTION_WINDOW_MS
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
