import { calendar_v3 as calendarV3 } from 'googleapis';

import { formatGoogleCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/utils/format-google-calendar-event.util';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

describe('formatGoogleCalendarEvents', () => {
  const mockGoogleEvent: calendarV3.Schema$Event = {
    id: 'event123',
    summary: 'Team Meeting',
    description: 'Weekly team sync',
    location: 'Conference Room A',
    status: 'confirmed',
    created: '2023-01-01T10:00:00Z',
    updated: '2023-01-02T10:00:00Z',
    iCalUID: 'event123@google.com',
    start: {
      dateTime: '2023-01-15T14:00:00Z',
    },
    end: {
      dateTime: '2023-01-15T15:00:00Z',
    },
    attendees: [
      {
        email: 'organizer@example.com',
        displayName: 'Meeting Organizer',
        organizer: true,
        responseStatus: 'accepted',
      },
      {
        email: 'attendee@example.com',
        displayName: 'Test Attendee',
        responseStatus: 'tentative',
      },
    ],
    conferenceData: {
      conferenceSolution: {
        key: {
          type: 'hangoutsMeet',
        },
      },
      entryPoints: [
        {
          uri: 'https://meet.google.com/abc-defg-hij',
        },
      ],
    },
  };

  it('should correctly format a normal Google Calendar event', () => {
    const result = formatGoogleCalendarEvents([mockGoogleEvent]);

    expect(result).toHaveLength(1);
    const formattedEvent = result[0];

    expect(formattedEvent.title).toBe('Team Meeting');
    expect(formattedEvent.description).toBe('Weekly team sync');
    expect(formattedEvent.location).toBe('Conference Room A');
    expect(formattedEvent.isCanceled).toBe(false);
    expect(formattedEvent.isFullDay).toBe(false);
    expect(formattedEvent.startsAt).toBe('2023-01-15T14:00:00Z');
    expect(formattedEvent.endsAt).toBe('2023-01-15T15:00:00Z');
    expect(formattedEvent.externalId).toBe('event123');
    expect(formattedEvent.conferenceSolution).toBe('hangoutsMeet');
    expect(formattedEvent.conferenceLinkUrl).toBe(
      'https://meet.google.com/abc-defg-hij',
    );

    expect(formattedEvent.participants).toHaveLength(2);
    expect(formattedEvent.participants[0].handle).toBe('organizer@example.com');
    expect(formattedEvent.participants[0].isOrganizer).toBe(true);
    expect(formattedEvent.participants[0].responseStatus).toBe(
      CalendarEventParticipantResponseStatus.ACCEPTED,
    );
    expect(formattedEvent.participants[1].handle).toBe('attendee@example.com');
    expect(formattedEvent.participants[1].responseStatus).toBe(
      CalendarEventParticipantResponseStatus.TENTATIVE,
    );
  });

  it('should sanitize a UCALID with improper exit char 0x00', () => {
    const mockGoogleEventWithImproperUcalid: calendarV3.Schema$Event = {
      ...mockGoogleEvent,
      iCalUID: '\u0000eventStrange@google.com',
    };

    const mockGoogleEventWithImproperUcalid2: calendarV3.Schema$Event = {
      ...mockGoogleEvent,
      iCalUID: '>\u0000\u0015-;_�^�W&�p\u001f�',
    };

    const result = formatGoogleCalendarEvents([
      mockGoogleEventWithImproperUcalid,
      mockGoogleEventWithImproperUcalid2,
    ]);

    expect(result[0].iCalUID).toBe('eventStrange@google.com');
    expect(result[1].iCalUID).toBe('>\u0015-;_�^�W&�p\u001f�');
  });
});
