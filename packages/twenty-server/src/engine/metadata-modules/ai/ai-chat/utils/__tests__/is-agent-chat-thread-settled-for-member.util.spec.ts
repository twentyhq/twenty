import { isAgentChatThreadSettledForMember } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-thread-settled-for-member.util';

const MEMBER_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_MEMBER_ID = '20202020-0000-4000-8000-000000000002';

const SETTLED_THREAD = {
  workspaceMemberId: MEMBER_ID,
  deletedAt: null,
  pendingQuestionMessageId: null,
  lastActivityAt: '2026-11-02T10:00:00.000Z',
  lastMessageSenderWorkspaceMemberId: null,
  assigneeId: null,
};

const SETTLED_PARTICIPANT = {
  workspaceMemberId: MEMBER_ID,
  isSubscribed: true,
  archivedAt: null,
  lastReadAt: new Date('2026-11-02T10:00:00.000Z'),
  lastMentionedAt: null,
  mentionsResolvedAt: null,
};

describe('isAgentChatThreadSettledForMember', () => {
  it.each([
    {
      title: 'a read chat nobody waits on',
      thread: {},
      participant: {},
      expected: true,
    },
    {
      title: 'activity the member has not read',
      thread: { lastActivityAt: '2026-11-02T10:00:01.000Z' },
      participant: {},
      expected: false,
    },
    {
      title: 'an unresolved mention',
      thread: {},
      participant: { lastMentionedAt: new Date('2026-11-02T09:00:00.000Z') },
      expected: false,
    },
    {
      title: 'a mention already resolved',
      thread: {},
      participant: {
        lastMentionedAt: new Date('2026-11-02T09:00:00.000Z'),
        mentionsResolvedAt: new Date('2026-11-02T09:00:00.000Z'),
      },
      expected: true,
    },
    {
      title: 'a pending question',
      thread: { pendingQuestionMessageId: 'message' },
      participant: {},
      expected: false,
    },
    {
      title: 'a chat assigned to the member',
      thread: { assigneeId: MEMBER_ID },
      participant: {},
      expected: false,
    },
    {
      title: 'a chat another member owns',
      thread: { workspaceMemberId: OTHER_MEMBER_ID },
      participant: {},
      expected: false,
    },
    {
      title: 'a chat already filed',
      thread: {},
      participant: { archivedAt: new Date('2026-11-02T10:00:00.001Z') },
      expected: false,
    },
  ])('answers $expected for $title', ({ thread, participant, expected }) => {
    expect(
      isAgentChatThreadSettledForMember({
        thread: { ...SETTLED_THREAD, ...thread },
        participant: { ...SETTLED_PARTICIPANT, ...participant },
      }),
    ).toBe(expected);
  });
});
