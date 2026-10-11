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
      'reads a chat without a row up to its last activity',
      undefined,
      'READ',
      { threadLastActivityAt: EARLIER },
      READ,
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
      'archives without following the chat again',
      SNOOZED_UNSUBSCRIBED,
      'ARCHIVE',
      {},
      { ...READ, archivedAt: NOW.toISOString(), isSubscribed: false },
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
});
