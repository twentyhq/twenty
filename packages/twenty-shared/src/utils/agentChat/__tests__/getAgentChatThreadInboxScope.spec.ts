import { getAgentChatThreadInboxScope } from '@/utils/agentChat/getAgentChatThreadInboxScope';

const NOW = new Date('2026-10-01T12:00:00.000Z');

const participant = (
  overrides: Partial<{
    lastReadAt: string | null;
    archivedAt: string | null;
    snoozedUntil: string | null;
  }> = {},
) => ({
  lastReadAt: null,
  archivedAt: null,
  snoozedUntil: null,
  ...overrides,
});

describe('getAgentChatThreadInboxScope', () => {
  it('keeps a thread nobody has acted on in the inbox', () => {
    expect(
      getAgentChatThreadInboxScope(
        { lastActivityAt: '2026-10-01T10:00:00.000Z', participant: null },
        NOW,
      ),
    ).toBe('INBOX');
  });

  it('keeps a thread that was never archived in the inbox', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          participant: participant({ lastReadAt: '2026-10-01T10:00:00.000Z' }),
        },
        NOW,
      ),
    ).toBe('INBOX');
  });

  it('archives a thread with no activity since the archive', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          participant: participant({ archivedAt: '2026-10-01T11:00:00.000Z' }),
        },
        NOW,
      ),
    ).toBe('ARCHIVED');
  });

  it('keeps the archive when activity and archive share the same instant', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T11:00:00.000Z',
          participant: participant({ archivedAt: '2026-10-01T11:00:00.000Z' }),
        },
        NOW,
      ),
    ).toBe('ARCHIVED');
  });

  it('brings an archived thread back when activity follows the archive', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T11:30:00.000Z',
          participant: participant({ archivedAt: '2026-10-01T11:00:00.000Z' }),
        },
        NOW,
      ),
    ).toBe('INBOX');
  });

  it('snoozes a thread until its snooze time', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          participant: participant({
            archivedAt: '2026-10-01T11:00:00.000Z',
            snoozedUntil: '2026-10-02T09:00:00.000Z',
          }),
        },
        NOW,
      ),
    ).toBe('SNOOZED');
  });

  it('brings a snoozed thread back once its snooze time has passed', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          participant: participant({
            archivedAt: '2026-10-01T11:00:00.000Z',
            snoozedUntil: '2026-10-01T11:30:00.000Z',
          }),
        },
        NOW,
      ),
    ).toBe('INBOX');
  });

  it('brings a snoozed thread back early when activity follows the snooze', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T11:45:00.000Z',
          participant: participant({
            archivedAt: '2026-10-01T11:00:00.000Z',
            snoozedUntil: '2026-10-02T09:00:00.000Z',
          }),
        },
        NOW,
      ),
    ).toBe('INBOX');
  });

  it('brings a snoozed thread back at the exact snooze time', () => {
    expect(
      getAgentChatThreadInboxScope(
        {
          lastActivityAt: '2026-10-01T10:00:00.000Z',
          participant: participant({
            archivedAt: '2026-10-01T11:00:00.000Z',
            snoozedUntil: NOW.toISOString(),
          }),
        },
        NOW,
      ),
    ).toBe('INBOX');
  });
});
