import { isAgentChatSnoozeStillWaiting } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-snooze-still-waiting.util';

const SNOOZED_UNTIL = '2026-11-02T10:00:00.000Z';

describe('isAgentChatSnoozeStillWaiting', () => {
  it('waits for a snooze stored as a Date when the job carries its end as a string', () => {
    expect(
      isAgentChatSnoozeStillWaiting({
        archivedAt: new Date('2026-11-02T09:00:00.000Z'),
        snoozedUntil: new Date(SNOOZED_UNTIL),
        jobSnoozedUntil: SNOOZED_UNTIL,
      }),
    ).toBe(true);
  });

  it('stops for a snooze that already ended, which keeps its end', () => {
    expect(
      isAgentChatSnoozeStillWaiting({
        archivedAt: null,
        snoozedUntil: new Date(SNOOZED_UNTIL),
        jobSnoozedUntil: SNOOZED_UNTIL,
      }),
    ).toBe(false);
  });

  it('stops for a snooze replaced by another end', () => {
    expect(
      isAgentChatSnoozeStillWaiting({
        archivedAt: new Date('2026-11-02T09:00:00.000Z'),
        snoozedUntil: new Date('2026-11-02T11:00:00.000Z'),
        jobSnoozedUntil: SNOOZED_UNTIL,
      }),
    ).toBe(false);
  });

  it('waits whatever this server clock says, since the database clock decides the end', () => {
    expect(
      isAgentChatSnoozeStillWaiting({
        archivedAt: new Date('2000-01-01T00:00:00.000Z'),
        snoozedUntil: new Date('2000-01-01T00:00:01.000Z'),
        jobSnoozedUntil: '2000-01-01T00:00:01.000Z',
      }),
    ).toBe(true);
  });
});
