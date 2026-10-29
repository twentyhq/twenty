import { type AgentChatInboxAction } from '@/ai/types/AgentChatInboxAction';
import { type AgentChatInboxState } from '@/ai/types/AgentChatInboxState';
import { applyAgentChatInboxAction } from '@/ai/utils/apply-agent-chat-inbox-action.util';

const NOW = new Date('2026-10-01T10:00:00.000Z');
const EARLIER = '2026-10-01T09:00:00.000Z';
const LATER = '2026-10-01T11:00:00.000Z';

const READ: AgentChatInboxState = {
  lastReadAt: EARLIER,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  lastResolvedMentionAt: null,
};
const SNOOZED_UNSUBSCRIBED: AgentChatInboxState = {
  ...READ,
  archivedAt: EARLIER,
  snoozedUntil: LATER,
  isSubscribed: false,
};

// Mirrors what the server's upsert for each action writes
describe('applyAgentChatInboxAction', () => {
  it.each<
    [
      string,
      AgentChatInboxState | undefined,
      AgentChatInboxAction,
      Partial<Parameters<typeof applyAgentChatInboxAction>[0]>,
      AgentChatInboxState,
    ]
  >([
    [
      'reads a chat without a row up to its last activity, without following it',
      undefined,
      'READ',
      { threadLastActivityAt: EARLIER },
      { ...READ, isSubscribed: false },
    ],
    [
      'marks a chat without a row unread, without following it',
      undefined,
      'UNREAD',
      {},
      { ...READ, lastReadAt: null, isSubscribed: false },
    ],
    [
      'never moves the read cursor back',
      { ...READ, lastReadAt: LATER },
      'READ',
      { threadLastActivityAt: EARLIER },
      { ...READ, lastReadAt: LATER },
    ],
    ['marks unread', READ, 'UNREAD', {}, { ...READ, lastReadAt: null }],
    [
      'archives and follows the chat again',
      SNOOZED_UNSUBSCRIBED,
      'ARCHIVE',
      {},
      { ...READ, archivedAt: NOW.toISOString() },
    ],
    [
      'snoozes and follows the chat again',
      { ...READ, isSubscribed: false },
      'SNOOZE',
      { snoozedUntil: LATER },
      { ...READ, archivedAt: NOW.toISOString(), snoozedUntil: LATER },
    ],
    [
      'saves as ended a snooze already due',
      READ,
      'SNOOZE',
      { snoozedUntil: EARLIER },
      { ...READ, snoozedUntil: EARLIER },
    ],
    [
      'moves back to the inbox',
      SNOOZED_UNSUBSCRIBED,
      'MOVE_TO_INBOX',
      {},
      READ,
    ],
    ['subscribes', { ...READ, isSubscribed: false }, 'SUBSCRIBE', {}, READ],
    [
      'files an unsubscribed chat under done',
      SNOOZED_UNSUBSCRIBED,
      'UNSUBSCRIBE',
      {},
      { ...READ, archivedAt: NOW.toISOString(), isSubscribed: false },
    ],
  ])('%s', (_, participant, action, options, expected) => {
    expect(
      applyAgentChatInboxAction({ participant, action, now: NOW, ...options }),
    ).toEqual(expected);
  });

  it.each<AgentChatInboxAction>(['READ', 'ARCHIVE', 'UNSUBSCRIBE'])(
    'resolves the recorded mention on %s',
    (action) => {
      expect(
        applyAgentChatInboxAction({
          participant: { ...READ, lastMentionedAt: EARLIER },
          action,
          now: NOW,
        }),
      ).toMatchObject({
        lastMentionedAt: EARLIER,
        lastResolvedMentionAt: EARLIER,
      });
    },
  );

  it('keeps a later mention resolution when marking done', () => {
    expect(
      applyAgentChatInboxAction({
        participant: {
          ...READ,
          lastMentionedAt: EARLIER,
          lastResolvedMentionAt: LATER,
        },
        action: 'ARCHIVE',
        now: NOW,
      }).lastResolvedMentionAt,
    ).toBe(LATER);
  });

  it.each<AgentChatInboxAction>([
    'UNREAD',
    'SNOOZE',
    'MOVE_TO_INBOX',
    'SUBSCRIBE',
  ])('preserves unresolved mentions on %s', (action) => {
    expect(
      applyAgentChatInboxAction({
        participant: { ...READ, lastMentionedAt: EARLIER },
        action,
        now: NOW,
        snoozedUntil: LATER,
      }),
    ).toMatchObject({
      lastMentionedAt: EARLIER,
      lastResolvedMentionAt: null,
    });
  });
});
