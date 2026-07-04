import { type Event } from '@microsoft/microsoft-graph-types';

import { formatMicrosoftCalendarEvents } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/format-microsoft-calendar-event.util';
import { CalendarEventParticipantResponseStatus } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';

describe('formatMicrosoftCalendarEvents', () => {
  const mockMicrosoftEvent: Event = {
    id: 'event123',
    subject: 'Team Meeting',
    body: {
      content: 'Weekly team sync',
      contentType: 'text',
    },
    location: {
      displayName: 'Conference Room A',
    },
    isCancelled: false,
    isAllDay: false,
    createdDateTime: '2023-01-01T10:00:00Z',
    lastModifiedDateTime: '2023-01-02T10:00:00Z',
    iCalUId: 'event123@microsoft.com',
    start: {
      dateTime: '2023-01-15T14:00:00Z',
      timeZone: 'UTC',
    },
    end: {
      dateTime: '2023-01-15T15:00:00Z',
      timeZone: 'UTC',
    },
    attendees: [
      {
        emailAddress: {
          address: 'organizer@example.com',
          name: 'Meeting Organizer',
        },
        status: {
          response: 'organizer',
        },
      },
      {
        emailAddress: {
          address: 'attendee@example.com',
          name: 'Test Attendee',
        },
        status: {
          response: 'tentativelyAccepted',
        },
      },
    ],
    onlineMeetingProvider: 'teamsForBusiness',
    onlineMeeting: {
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/abc123',
    },
  };

  it('should correctly format a normal Microsoft Calendar event', () => {
    const result = formatMicrosoftCalendarEvents([mockMicrosoftEvent]);

    expect(result).toHaveLength(1);
    const formattedEvent = result[0];

    expect(formattedEvent.title).toBe('Team Meeting');
    expect(formattedEvent.description).toBe('Weekly team sync');
    expect(formattedEvent.location).toBe('Conference Room A');
    expect(formattedEvent.isCanceled).toBe(false);
    expect(formattedEvent.isFullDay).toBe(false);
    expect(formattedEvent.startsAt).toBe('2023-01-15T14:00:00Z');
    expect(formattedEvent.endsAt).toBe('2023-01-15T15:00:00Z');
    expect(formattedEvent.id).toBe('event123');
    expect(formattedEvent.conferenceSolution).toBe('teamsForBusiness');
    expect(formattedEvent.conferenceLinkUrl).toBe(
      'https://teams.microsoft.com/l/meetup-join/abc123',
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

  it('should sanitize a Microsoft Calendar event with improper exit char 0x00', () => {
    const mockMicrosoftEventWithImproperData: Event = {
      ...mockMicrosoftEvent,
      iCalUId: '\u0000eventStrange@microsoft.com',
    };

    const mockMicrosoftEventWithImproperData2: Event = {
      ...mockMicrosoftEvent,
      iCalUId: '>\u0000\u0015-;_�^�W&�p\u001f�',
    };

    const result = formatMicrosoftCalendarEvents([
      mockMicrosoftEventWithImproperData,
      mockMicrosoftEventWithImproperData2,
    ]);

    expect(result[0].iCalUid).toBe('eventStrange@microsoft.com');
    expect(result[1].iCalUid).toBe('>\u0015-;_�^�W&�p\u001f�');
  });
});
