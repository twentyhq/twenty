import { AgentChatThreadConversationType } from '@/ai/types/AgentChatThreadConversationType';
import { isAgentChatThreadInPresetFilter } from '@/ai/utils/is-agent-chat-thread-in-preset-filter.util';

const OPEN_STATUS = {
  scope: 'INBOX',
  isMentioned: false,
  isAssignedToMe: false,
} as const;

describe('isAgentChatThreadInPresetFilter', () => {
  it('lists open chats under Open', () => {
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        presetFilter: 'active',
      }),
    ).toBe(true);
  });

  it('lists open chats waiting on an answer under Needs input', () => {
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: OPEN_STATUS,
        presetFilter: 'needsInput',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        presetFilter: 'needsInput',
      }),
    ).toBe(false);
  });

  it('lists open chats the member was mentioned in under Mentions', () => {
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: { ...OPEN_STATUS, isMentioned: true },
        presetFilter: 'mentions',
      }),
    ).toBe(true);
  });

  it('lists open chats assigned to the member under Assigned to me', () => {
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: { ...OPEN_STATUS, isAssignedToMe: true },
        presetFilter: 'assigned',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null },
        inboxStatus: OPEN_STATUS,
        presetFilter: 'assigned',
      }),
    ).toBe(false);
  });

  it('splits open chats by whether anyone is assigned', () => {
    const assignedThread = {
      pendingQuestionMessageId: null,
      assigneeId: 'member-2',
    };
    const unassignedThread = {
      pendingQuestionMessageId: null,
      assigneeId: null,
    };

    expect(
      isAgentChatThreadInPresetFilter({
        thread: assignedThread,
        inboxStatus: OPEN_STATUS,
        presetFilter: 'assignedToAnyone',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: unassignedThread,
        inboxStatus: OPEN_STATUS,
        presetFilter: 'assignedToAnyone',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: unassignedThread,
        inboxStatus: OPEN_STATUS,
        presetFilter: 'unassigned',
      }),
    ).toBe(true);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: assignedThread,
        inboxStatus: OPEN_STATUS,
        presetFilter: 'unassigned',
      }),
    ).toBe(false);
  });

  it('leaves done chats out of the views narrowing Open', () => {
    const doneStatus = {
      scope: 'ARCHIVED',
      isMentioned: true,
      isAssignedToMe: true,
    } as const;

    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        presetFilter: 'needsInput',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        presetFilter: 'mentions',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        presetFilter: 'assigned',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null, assigneeId: 'member-2' },
        inboxStatus: doneStatus,
        presetFilter: 'assignedToAnyone',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: null, assigneeId: null },
        inboxStatus: doneStatus,
        presetFilter: 'unassigned',
      }),
    ).toBe(false);
    expect(
      isAgentChatThreadInPresetFilter({
        thread: { pendingQuestionMessageId: 'message' },
        inboxStatus: doneStatus,
        presetFilter: 'done',
      }),
    ).toBe(true);
  });

  it.each([
    ['active', OPEN_STATUS, {}],
    ['needsInput', OPEN_STATUS, { pendingQuestionMessageId: 'message' }],
    ['mentions', { ...OPEN_STATUS, isMentioned: true }, {}],
    ['assigned', { ...OPEN_STATUS, isAssignedToMe: true }, {}],
    ['assignedToAnyone', OPEN_STATUS, { assigneeId: 'member-2' }],
    ['unassigned', OPEN_STATUS, { assigneeId: null }],
    ['snoozed', { ...OPEN_STATUS, scope: 'SNOOZED' }, {}],
    ['done', { ...OPEN_STATUS, scope: 'ARCHIVED' }, {}],
  ] as const)(
    'leaves direct messages out of %s',
    (presetFilter, inboxStatus, thread) => {
      expect(
        isAgentChatThreadInPresetFilter({
          thread: {
            ...thread,
            conversationType: AgentChatThreadConversationType.STANDARD,
          },
          inboxStatus,
          presetFilter,
        }),
      ).toBe(true);
      expect(
        isAgentChatThreadInPresetFilter({
          thread: {
            ...thread,
            conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
          },
          inboxStatus,
          presetFilter,
        }),
      ).toBe(false);
    },
  );
});
