import {
  AGENT_CHAT_INBOX_NOTIFICATION_LEVEL,
  type AgentChatInboxState,
  AgentChatThreadConversationType,
} from 'twenty-shared/ai';

import { getAgentChatWebPushNotificationReason } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-web-push-notification-reason.util';

const ME = 'member-me';
const FELIX = 'member-felix';
const LAST_ACTIVITY_AT = '2026-11-16T10:00:00.000Z';

const channelThread = {
  deletedAt: null,
  lastActivityAt: LAST_ACTIVITY_AT,
  lastMessageSenderWorkspaceMemberId: FELIX,
  conversationType: AgentChatThreadConversationType.STANDARD,
  directMessageFirstWorkspaceMemberId: null,
  directMessageSecondWorkspaceMemberId: null,
  assigneeId: null,
};

const directMessageThread = {
  ...channelThread,
  conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
  directMessageFirstWorkspaceMemberId: FELIX,
  directMessageSecondWorkspaceMemberId: ME,
};

const unreadFollowedParticipant: AgentChatInboxState = {
  lastReadAt: '2026-11-16T09:00:00.000Z',
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
};

const getReason = (
  overrides: Partial<
    Parameters<typeof getAgentChatWebPushNotificationReason>[0]
  >,
) =>
  getAgentChatWebPushNotificationReason({
    thread: channelThread,
    participant: unreadFollowedParticipant,
    workspaceMemberId: ME,
    inboxNotificationLevel: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.ALL_FOLLOWED,
    hasUnalertedMention: false,
    ...overrides,
  });

describe('getAgentChatWebPushNotificationReason', () => {
  it('should notify for an unread message in a followed chat', () => {
    expect(getReason({})).toBe('FOLLOWED');
  });

  it('should not notify for my own message, a deleted chat or a read message', () => {
    expect(
      getReason({
        thread: { ...channelThread, lastMessageSenderWorkspaceMemberId: ME },
      }),
    ).toBeNull();
    expect(
      getReason({ thread: { ...channelThread, deletedAt: LAST_ACTIVITY_AT } }),
    ).toBeNull();
    expect(
      getReason({
        participant: {
          ...unreadFollowedParticipant,
          lastReadAt: LAST_ACTIVITY_AT,
        },
      }),
    ).toBeNull();
  });

  it('should notify for a direct message before its participant row exists', () => {
    expect(
      getReason({ thread: directMessageThread, participant: undefined }),
    ).toBe('DIRECT_MESSAGE');
  });

  it('should notify for a mention only until it has been alerted', () => {
    const inboxNotificationLevel =
      AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED;
    const mentionedParticipant = {
      ...unreadFollowedParticipant,
      isSubscribed: false,
      lastMentionedAt: '2026-11-16T09:30:00.000Z',
    };

    expect(
      getReason({
        inboxNotificationLevel,
        participant: mentionedParticipant,
        hasUnalertedMention: true,
      }),
    ).toBe('MENTION');
    expect(
      getReason({
        inboxNotificationLevel,
        participant: mentionedParticipant,
      }),
    ).toBeNull();
  });

  it('should keep followed chats out of the direct messages and mentions level', () => {
    const inboxNotificationLevel =
      AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.DIRECT_MENTIONS_AND_ASSIGNED;

    expect(getReason({ inboxNotificationLevel })).toBeNull();
    expect(
      getReason({
        inboxNotificationLevel,
        thread: { ...channelThread, assigneeId: ME },
      }),
    ).toBe('ASSIGNED');
  });

  it('should never notify when notifications are off', () => {
    expect(
      getReason({
        inboxNotificationLevel: AGENT_CHAT_INBOX_NOTIFICATION_LEVEL.NONE,
        thread: directMessageThread,
      }),
    ).toBeNull();
  });
});
