import { buildNextAgentChatThreadActivityAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-thread-activity-at.util';

describe('buildNextAgentChatThreadActivityAt', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-05T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses the current time when it is after every stamp', () => {
    expect(
      buildNextAgentChatThreadActivityAt({
        lastActivityAt: '2026-11-05T11:59:00.000Z',
        updatedAt: null,
      }).toISOString(),
    ).toBe('2026-11-05T12:00:00.000Z');
  });

  it('stays after a stamp written by a clock ahead of this one', () => {
    expect(
      buildNextAgentChatThreadActivityAt({
        lastActivityAt: '2026-11-05T12:00:00.500Z',
        updatedAt: '2026-11-05T12:00:01.000Z',
      }).toISOString(),
    ).toBe('2026-11-05T12:00:01.001Z');
  });
});
