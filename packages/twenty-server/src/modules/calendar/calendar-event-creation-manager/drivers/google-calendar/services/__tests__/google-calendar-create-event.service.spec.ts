import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import { GoogleCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/google-calendar/services/google-calendar-create-event.service';
import { CalendarEventCreationException } from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

const connectedAccount = {
  id: 'account-1',
  provider: ConnectedAccountProvider.GOOGLE,
};

const baseInput: CalendarEventToCreate = {
  title: 'Sync',
  startsAt: '2026-07-01T14:00:00Z',
  endsAt: '2026-07-01T15:00:00Z',
  isFullDay: false,
  timeZone: 'UTC',
  attendees: [],
  sendInvitations: false,
  addConferencing: false,
};

describe('GoogleCalendarCreateEventService', () => {
  let service: GoogleCalendarCreateEventService;
  const insert = jest.fn();
  const get = jest.fn();

  beforeEach(async () => {
    jest
      .spyOn(google, 'calendar')
      .mockReturnValue({ events: { insert, get } } as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCalendarCreateEventService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get(GoogleCalendarCreateEventService);

    insert.mockResolvedValue({
      data: {
        id: 'google-event-1',
        iCalUID: 'google-event-1@google.com',
        summary: 'Sync',
        status: 'confirmed',
        start: { dateTime: '2026-07-01T14:00:00Z' },
        end: { dateTime: '2026-07-01T15:00:00Z' },
      },
    });
  });

  afterEach(() => {
    insert.mockReset();
    get.mockReset();
    jest.restoreAllMocks();
  });

  it('inserts the event without notifications or conferencing by default', async () => {
    const result = await service.createCalendarEvent(
      baseInput,
      connectedAccount,
    );

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarId: 'primary',
        conferenceDataVersion: 0,
        sendUpdates: 'none',
        requestBody: expect.objectContaining({ summary: 'Sync' }),
      }),
    );
    expect(get).not.toHaveBeenCalled();
    expect(result.id).toBe('google-event-1');
    expect(result.iCalUid).toBe('google-event-1@google.com');
  });

  it('notifies attendees and requests conferencing when enabled', async () => {
    await service.createCalendarEvent(
      { ...baseInput, sendInvitations: true, addConferencing: true },
      connectedAccount,
    );

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      }),
    );
  });

  it('returns the Meet link from the insert response without re-fetching', async () => {
    insert.mockResolvedValue({
      data: {
        id: 'google-event-1',
        iCalUID: 'google-event-1@google.com',
        status: 'confirmed',
        start: { dateTime: '2026-07-01T14:00:00Z' },
        end: { dateTime: '2026-07-01T15:00:00Z' },
        conferenceData: {
          entryPoints: [{ uri: 'https://meet.google.com/abc-defg-hij' }],
        },
      },
    });

    const result = await service.createCalendarEvent(
      { ...baseInput, addConferencing: true },
      connectedAccount,
    );

    expect(get).not.toHaveBeenCalled();
    expect(result.conferenceLinkUrl).toBe(
      'https://meet.google.com/abc-defg-hij',
    );
  });

  it('wraps provider errors in a CalendarEventCreationException', async () => {
    insert.mockRejectedValue(new Error('boom'));

    await expect(
      service.createCalendarEvent(baseInput, connectedAccount),
    ).rejects.toThrow(CalendarEventCreationException);
  });
});
