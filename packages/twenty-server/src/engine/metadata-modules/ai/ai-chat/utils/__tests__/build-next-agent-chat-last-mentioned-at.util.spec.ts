import { buildNextAgentChatLastMentionedAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-last-mentioned-at.util';

const CURRENT_TIME = '2026-11-04T12:00:00.000Z';

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(CURRENT_TIME));
});

afterEach(() => {
  jest.useRealTimers();
});

it.each([
  { lastMentionedAt: null, mentionsResolvedAt: null, expected: CURRENT_TIME },
  {
    lastMentionedAt: '2026-11-04T13:00:00.000Z',
    mentionsResolvedAt: null,
    expected: '2026-11-04T13:00:00.001Z',
  },
  {
    lastMentionedAt: '2026-11-04T13:00:00.000Z',
    mentionsResolvedAt: '2026-11-04T14:00:00.000Z',
    expected: '2026-11-04T14:00:00.001Z',
  },
])(
  'keeps a new mention later than stored timestamps: $expected',
  ({ lastMentionedAt, mentionsResolvedAt, expected }) => {
    expect(
      buildNextAgentChatLastMentionedAt({
        lastMentionedAt,
        mentionsResolvedAt,
      }),
    ).toBe(expected);
  },
);
