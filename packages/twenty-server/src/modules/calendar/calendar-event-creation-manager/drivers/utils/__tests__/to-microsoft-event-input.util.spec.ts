import { toMicrosoftEventInput } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/to-microsoft-event-input.util';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';

const baseInput: CalendarEventToCreate = {
  title: 'Team Sync',
  description: 'Weekly sync',
  location: 'Room A',
  startsAt: '2026-07-01T14:00:00Z',
  endsAt: '2026-07-01T15:00:00Z',
  isFullDay: false,
  timeZone: 'America/New_York',
  attendees: [],
  sendInvitations: false,
  addConferencing: false,
};

describe('toMicrosoftEventInput', () => {
  it('converts the absolute instant to wall-clock in the event time zone (Graph ignores the offset)', () => {
    // 14:00Z / 15:00Z in July is 10:00 / 11:00 in America/New_York (EDT, UTC-4).
    const event = toMicrosoftEventInput(baseInput);

    expect(event).toMatchObject({
      subject: 'Team Sync',
      body: { contentType: 'text', content: 'Weekly sync' },
      start: { dateTime: '2026-07-01T10:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2026-07-01T11:00:00', timeZone: 'America/New_York' },
      isAllDay: false,
      location: { displayName: 'Room A' },
    });
    expect(event.attendees).toBeUndefined();
    expect(event.isOnlineMeeting).toBeUndefined();
  });

  it('keeps the wall-clock unchanged when the event time zone is UTC', () => {
    const event = toMicrosoftEventInput({ ...baseInput, timeZone: 'UTC' });

    expect(event.start).toEqual({
      dateTime: '2026-07-01T14:00:00',
      timeZone: 'UTC',
    });
  });

  it('pins all-day events to midnight in the event time zone', () => {
    const event = toMicrosoftEventInput({
      ...baseInput,
      isFullDay: true,
      startsAt: '2026-07-01T09:30:00Z',
      endsAt: '2026-07-02T09:30:00Z',
    });

    expect(event.isAllDay).toBe(true);
    expect(event.start).toEqual({
      dateTime: '2026-07-01T00:00:00',
      timeZone: 'America/New_York',
    });
    expect(event.end).toEqual({
      dateTime: '2026-07-02T00:00:00',
      timeZone: 'America/New_York',
    });
  });

  it('maps attendees as required participants', () => {
    const event = toMicrosoftEventInput({
      ...baseInput,
      attendees: [{ email: 'guest@example.com', displayName: 'Guest' }],
    });

    expect(event.attendees).toEqual([
      {
        emailAddress: { address: 'guest@example.com', name: 'Guest' },
        type: 'required',
      },
    ]);
  });

  it('requests a Teams meeting when conferencing is enabled', () => {
    const event = toMicrosoftEventInput({
      ...baseInput,
      addConferencing: true,
    });

    expect(event.isOnlineMeeting).toBe(true);
    expect(event.onlineMeetingProvider).toBe('teamsForBusiness');
  });
});
