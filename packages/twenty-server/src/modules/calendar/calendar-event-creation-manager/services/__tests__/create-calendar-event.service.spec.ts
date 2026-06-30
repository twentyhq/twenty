import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalDavCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/caldav/services/caldav-create-event.service';
import { GoogleCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/google-calendar/services/google-calendar-create-event.service';
import { MicrosoftCalendarCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/microsoft-calendar/services/microsoft-calendar-create-event.service';
import { CalendarEventCreationException } from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { CreateCalendarEventService } from 'src/modules/calendar/calendar-event-creation-manager/services/create-calendar-event.service';
import { type ComposedCalendarEvent } from 'src/modules/calendar/calendar-event-creation-manager/types/composed-calendar-event.type';
import { CalendarSaveEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-save-events.service';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

const composedEvent = (
  provider: ConnectedAccountProvider,
): ComposedCalendarEvent =>
  ({
    input: {
      title: 'Sync',
      startsAt: '2026-07-01T14:00:00Z',
      endsAt: '2026-07-01T15:00:00Z',
      isFullDay: false,
      timeZone: 'UTC',
      attendees: [],
      sendInvitations: false,
      addConferencing: false,
    },
    connectedAccount: { id: 'account-1', provider },
    calendarChannel: { id: 'channel-1' },
  }) as unknown as ComposedCalendarEvent;

const createdEvent = { id: 'event-1' } as FetchedCalendarEvent;

describe('CreateCalendarEventService', () => {
  let service: CreateCalendarEventService;
  const googleCreate = jest.fn();
  const microsoftCreate = jest.fn();
  const calDavCreate = jest.fn();
  const saveCalendarEvents = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCalendarEventService,
        {
          provide: GoogleCalendarCreateEventService,
          useValue: { createCalendarEvent: googleCreate },
        },
        {
          provide: MicrosoftCalendarCreateEventService,
          useValue: { createCalendarEvent: microsoftCreate },
        },
        {
          provide: CalDavCreateEventService,
          useValue: { createCalendarEvent: calDavCreate },
        },
        {
          provide: CalendarSaveEventsService,
          useValue: {
            saveCalendarEventsAndEnqueueContactCreationJob: saveCalendarEvents,
          },
        },
      ],
    }).compile();

    service = module.get(CreateCalendarEventService);
  });

  afterEach(() => jest.clearAllMocks());

  it('routes Google accounts to the Google driver', async () => {
    const data = composedEvent(ConnectedAccountProvider.GOOGLE);

    await service.createComposedCalendarEvent(data);

    expect(googleCreate).toHaveBeenCalledWith(
      data.input,
      data.connectedAccount,
    );
    expect(microsoftCreate).not.toHaveBeenCalled();
  });

  it('routes Microsoft accounts to the Microsoft driver', async () => {
    const data = composedEvent(ConnectedAccountProvider.MICROSOFT);

    await service.createComposedCalendarEvent(data);

    expect(microsoftCreate).toHaveBeenCalledWith(
      data.input,
      data.connectedAccount,
    );
    expect(googleCreate).not.toHaveBeenCalled();
  });

  it('routes CalDAV accounts to the CalDav driver', async () => {
    const data = composedEvent(ConnectedAccountProvider.IMAP_SMTP_CALDAV);

    await service.createComposedCalendarEvent(data);

    expect(calDavCreate).toHaveBeenCalledWith(
      data.input,
      data.connectedAccount,
    );
    expect(googleCreate).not.toHaveBeenCalled();
    expect(microsoftCreate).not.toHaveBeenCalled();
  });

  it('throws for unsupported providers', async () => {
    await expect(
      service.createComposedCalendarEvent(
        composedEvent(ConnectedAccountProvider.EMAIL_GROUP),
      ),
    ).rejects.toThrow(CalendarEventCreationException);
  });

  it('persists the created event through the save service', async () => {
    const data = composedEvent(ConnectedAccountProvider.GOOGLE);

    await service.persistCalendarEvent(createdEvent, data, 'workspace-1');

    expect(saveCalendarEvents).toHaveBeenCalledWith(
      [createdEvent],
      data.calendarChannel,
      data.connectedAccount,
      'workspace-1',
    );
  });

  it('swallows persistence failures so the create still succeeds', async () => {
    saveCalendarEvents.mockRejectedValue(new Error('db down'));

    await expect(
      service.persistCalendarEvent(
        createdEvent,
        composedEvent(ConnectedAccountProvider.GOOGLE),
        'workspace-1',
      ),
    ).resolves.toBeUndefined();
  });
});
