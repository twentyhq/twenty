import { computeRealMeetingKey } from 'src/modules/calendar/calendar-event-recording-manager/utils/compute-real-meeting-key.util';

describe('computeRealMeetingKey', () => {
  it('should key on the normalized conference link and occurrence start when present', () => {
    expect(
      computeRealMeetingKey({
        calendarEventId: 'event-1',
        conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij',
        iCalUid: 'ical-1',
        startsAt: '2026-06-05T11:00:00.000Z',
      }),
    ).toBe('link:meet.google.com/abc-defg-hij:2026-06-05T11:00:00.000Z');
  });

  it('should produce the same key for two events sharing one meeting link at the same start', () => {
    const keyA = computeRealMeetingKey({
      calendarEventId: 'event-a',
      conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij?authuser=0',
      iCalUid: 'ical-a',
      startsAt: '2026-06-05T11:00:00.000Z',
    });

    const keyB = computeRealMeetingKey({
      calendarEventId: 'event-b',
      conferenceLinkUrl: 'http://www.meet.google.com/abc-defg-hij/',
      iCalUid: 'ical-b',
      startsAt: '2026-06-05T11:00:00.000Z',
    });

    expect(keyA).toBe(keyB);
  });

  it('should separate recurring occurrences that reuse the same meeting link', () => {
    const firstWeek = computeRealMeetingKey({
      calendarEventId: 'event-a',
      conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij',
      iCalUid: 'ical-a',
      startsAt: '2026-06-05T11:00:00.000Z',
    });

    const secondWeek = computeRealMeetingKey({
      calendarEventId: 'event-b',
      conferenceLinkUrl: 'https://meet.google.com/abc-defg-hij',
      iCalUid: 'ical-a',
      startsAt: '2026-06-12T11:00:00.000Z',
    });

    expect(firstWeek).not.toBe(secondWeek);
  });

  it('should fall back to iCalUid and occurrence start when there is no link', () => {
    expect(
      computeRealMeetingKey({
        calendarEventId: 'event-1',
        conferenceLinkUrl: null,
        iCalUid: 'recurring-uid@google.com',
        startsAt: '2026-06-05T11:00:00.000Z',
      }),
    ).toBe('ical:recurring-uid@google.com:2026-06-05T11:00:00.000Z');
  });

  it('should ignore malformed conference link provider data', () => {
    expect(
      computeRealMeetingKey({
        calendarEventId: 'event-1',
        conferenceLinkUrl: {
          primaryLinkUrl: 'not-a-string',
        } as unknown as string,
        iCalUid: 'recurring-uid@google.com',
        startsAt: '2026-06-05T11:00:00.000Z',
      }),
    ).toBe('ical:recurring-uid@google.com:2026-06-05T11:00:00.000Z');
  });

  it('should separate recurring occurrences by start time', () => {
    const firstOccurrence = computeRealMeetingKey({
      calendarEventId: 'event-1',
      conferenceLinkUrl: null,
      iCalUid: 'recurring-uid@google.com',
      startsAt: '2026-06-05T11:00:00.000Z',
    });

    const secondOccurrence = computeRealMeetingKey({
      calendarEventId: 'event-2',
      conferenceLinkUrl: null,
      iCalUid: 'recurring-uid@google.com',
      startsAt: '2026-06-12T11:00:00.000Z',
    });

    expect(firstOccurrence).not.toBe(secondOccurrence);
  });

  it('should fall back to the event id when there is no shared meeting identity', () => {
    expect(
      computeRealMeetingKey({
        calendarEventId: 'event-1',
        conferenceLinkUrl: null,
        iCalUid: null,
        startsAt: null,
      }),
    ).toBe('event:event-1');
  });
});
