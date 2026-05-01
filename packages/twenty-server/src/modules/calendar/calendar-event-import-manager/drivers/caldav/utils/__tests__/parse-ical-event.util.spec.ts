import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { parseICalEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-ical-event.util';

const HREF = 'https://caldav.example.com/calendars/user/event-1.ics';

const buildVCalendar = (vevents: string[][]) =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    ...vevents.flatMap((lines) => ['BEGIN:VEVENT', ...lines, 'END:VEVENT']),
    'END:VCALENDAR',
  ].join('\r\n');

const buildVEvent = (lines: string[]) => buildVCalendar([lines]);

describe('parseICalEvents', () => {
  it('returns an empty array when the payload contains no VEVENT', () => {
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'END:VCALENDAR'].join(
      '\r\n',
    );

    expect(parseICalEvents(ics, HREF)).toEqual([]);
  });

  it('extracts the canonical VEVENT fields', () => {
    const ics = buildVEvent([
      'UID:abc123',
      'SUMMARY:Quarterly review',
      'DESCRIPTION:Discuss Q2 numbers',
      'LOCATION:Room 4',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
    ]);

    const [event] = parseICalEvents(ics, HREF);

    expect(event).toMatchObject({
      id: HREF,
      iCalUid: 'abc123',
      title: 'Quarterly review',
      description: 'Discuss Q2 numbers',
      location: 'Room 4',
      startsAt: '2026-06-01T10:00:00.000Z',
      endsAt: '2026-06-01T11:00:00.000Z',
      isCanceled: false,
      status: 'CONFIRMED',
    });
  });

  it('falls back to "Untitled Event" when SUMMARY is missing', () => {
    const ics = buildVEvent([
      'UID:abc',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
    ]);

    expect(parseICalEvents(ics, HREF)[0].title).toBe('Untitled Event');
  });

  it('flags isFullDay when DTSTART carries VALUE=DATE', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Holiday',
      'DTSTART;VALUE=DATE:20260704',
      'DTEND;VALUE=DATE:20260705',
    ]);

    expect(parseICalEvents(ics, HREF)[0].isFullDay).toBe(true);
  });

  it('classifies isFullDay per-event when a full-day master has a timed recurrence override', () => {
    const ics = buildVCalendar([
      [
        'UID:series-fullday',
        'SUMMARY:Daily standup',
        'DTSTART;VALUE=DATE:20260601',
        'DTEND;VALUE=DATE:20260602',
        'RRULE:FREQ=DAILY',
      ],
      [
        'UID:series-fullday',
        'SUMMARY:Daily standup (rescheduled to a meeting)',
        'DTSTART:20260605T140000Z',
        'DTEND:20260605T143000Z',
        'RECURRENCE-ID;VALUE=DATE:20260605',
      ],
    ]);

    const [master, override] = parseICalEvents(ics, HREF);

    expect(master.isFullDay).toBe(true);
    expect(override.isFullDay).toBe(false);
  });

  it('flags isCanceled when STATUS:CANCELLED is present', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Off',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
      'STATUS:CANCELLED',
    ]);

    const [event] = parseICalEvents(ics, HREF);

    expect(event.isCanceled).toBe(true);
    expect(event.status).toBe('CANCELLED');
  });

  it('attaches recurringEventExternalId in ISO format when RECURRENCE-ID is present', () => {
    const ics = buildVEvent([
      'UID:series-1',
      'SUMMARY:Standup',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T101500Z',
      'RECURRENCE-ID:20260601T100000Z',
    ]);

    expect(parseICalEvents(ics, HREF)[0].recurringEventExternalId).toBe(
      '2026-06-01T10:00:00.000Z',
    );
  });

  it('returns master + override events as separate entries with unique ids (RFC 5545 §3.8.4.4)', () => {
    const ics = buildVCalendar([
      [
        'UID:series-1',
        'SUMMARY:Standup',
        'DTSTART:20260601T100000Z',
        'DTEND:20260601T101500Z',
        'RRULE:FREQ=WEEKLY',
      ],
      [
        'UID:series-1',
        'SUMMARY:Standup (rescheduled)',
        'DTSTART:20260609T110000Z',
        'DTEND:20260609T111500Z',
        'RECURRENCE-ID:20260608T100000Z',
      ],
    ]);

    const events = parseICalEvents(ics, HREF);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: HREF,
      iCalUid: 'series-1',
      recurringEventExternalId: undefined,
    });
    expect(events[1]).toMatchObject({
      id: `${HREF}#recurrence=2026-06-08T10:00:00.000Z`,
      iCalUid: 'series-1',
      title: 'Standup (rescheduled)',
      recurringEventExternalId: '2026-06-08T10:00:00.000Z',
    });
  });

  it('handles bare ORGANIZER (plain mailto, no CN) — node-ical returns a string', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Sync',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
      'ORGANIZER:mailto:bare@example.com',
    ]);

    expect(parseICalEvents(ics, HREF)[0].participants[0]).toMatchObject({
      handle: 'bare@example.com',
      displayName: 'bare@example.com',
      isOrganizer: true,
    });
  });

  it('handles bare ATTENDEE (plain mailto, no params) — node-ical returns a string', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Sync',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
      'ATTENDEE:mailto:bare@example.com',
    ]);

    const attendee = parseICalEvents(ics, HREF)[0].participants.find(
      (p) => !p.isOrganizer,
    );

    expect(attendee).toMatchObject({
      handle: 'bare@example.com',
      displayName: 'bare@example.com',
      isOrganizer: false,
    });
  });

  it('extracts the organizer with mailto stripped and ACCEPTED status', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Sync',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
      'ORGANIZER;CN=Alice Org:mailto:alice@example.com',
    ]);

    expect(parseICalEvents(ics, HREF)[0].participants[0]).toMatchObject({
      handle: 'alice@example.com',
      displayName: 'Alice Org',
      isOrganizer: true,
      responseStatus: CalendarEventParticipantResponseStatus.ACCEPTED,
    });
  });

  it('maps each ATTENDEE PARTSTAT to the matching response status', () => {
    const ics = buildVEvent([
      'UID:abc',
      'SUMMARY:Sync',
      'DTSTART:20260601T100000Z',
      'DTEND:20260601T110000Z',
      'ATTENDEE;CN=Bob;PARTSTAT=ACCEPTED:mailto:bob@example.com',
      'ATTENDEE;CN=Carol;PARTSTAT=DECLINED:mailto:carol@example.com',
      'ATTENDEE;CN=Dan;PARTSTAT=TENTATIVE:mailto:dan@example.com',
      'ATTENDEE;CN=Eve;PARTSTAT=NEEDS-ACTION:mailto:eve@example.com',
      'ATTENDEE;CN=Frank;PARTSTAT=DELEGATED:mailto:frank@example.com',
    ]);

    const [event] = parseICalEvents(ics, HREF);
    const byHandle = Object.fromEntries(
      event.participants.map((p) => [p.handle, p.responseStatus]),
    );

    expect(byHandle).toEqual({
      'bob@example.com': CalendarEventParticipantResponseStatus.ACCEPTED,
      'carol@example.com': CalendarEventParticipantResponseStatus.DECLINED,
      'dan@example.com': CalendarEventParticipantResponseStatus.TENTATIVE,
      'eve@example.com': CalendarEventParticipantResponseStatus.NEEDS_ACTION,
      'frank@example.com': CalendarEventParticipantResponseStatus.NEEDS_ACTION,
    });
  });

  it('returns an empty array and does not throw when iCal data is malformed', () => {
    expect(parseICalEvents('not a calendar', HREF)).toEqual([]);
  });

  it('skips a VEVENT missing DTSTART without dropping its siblings', () => {
    const ics = buildVCalendar([
      ['UID:no-start', 'SUMMARY:Broken'],
      [
        'UID:healthy',
        'SUMMARY:Healthy',
        'DTSTART:20260601T100000Z',
        'DTEND:20260601T110000Z',
      ],
    ]);

    const events = parseICalEvents(ics, HREF);

    expect(events.map((event) => event.iCalUid)).toEqual(['healthy']);
  });
});
