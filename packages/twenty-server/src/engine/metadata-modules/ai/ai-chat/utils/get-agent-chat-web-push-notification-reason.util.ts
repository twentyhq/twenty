import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxState,
  AgentChatThreadConversationType,
  getAgentChatThreadInboxStatus,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

export const getAgentChatWebPushNotificationReason = ({
  thread,
  participant,
  workspaceMemberId,
  inboxNotificationLevel,
  hasUnalertedMention,
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
  hasUnalertedMention: boolean;
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

  const { isUnread, scope } = getAgentChatThreadInboxStatus({
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

  if (hasUnalertedMention) {
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
