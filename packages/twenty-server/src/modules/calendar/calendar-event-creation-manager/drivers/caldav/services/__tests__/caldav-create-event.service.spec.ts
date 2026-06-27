import { Test, type TestingModule } from '@nestjs/testing';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { CalDavCreateEventService } from 'src/modules/calendar/calendar-event-creation-manager/drivers/caldav/services/caldav-create-event.service';
import { CalendarEventCreationException } from 'src/modules/calendar/calendar-event-creation-manager/exceptions/calendar-event-creation.exception';
import { type CalendarEventToCreate } from 'src/modules/calendar/calendar-event-creation-manager/types/calendar-event-to-create.type';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';

const connectedAccount = {
  id: 'account-1',
  provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
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

const CALENDAR_URL = 'https://dav.example.com/calendars/jane/default/';

describe('CalDavCreateEventService', () => {
  let service: CalDavCreateEventService;
  const createCalendarObject = jest.fn();
  const client = { createCalendarObject };
  const getClient = jest.fn();
  const listEventCalendars = jest.fn();
  const fetchEventsByHrefs = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalDavCreateEventService,
        { provide: CalDavClientProvider, useValue: { getClient } },
        {
          provide: CalDavFetchEventsService,
          useValue: { listEventCalendars, fetchEventsByHrefs },
        },
      ],
    }).compile();

    service = module.get(CalDavCreateEventService);

    getClient.mockResolvedValue(client);
    listEventCalendars.mockResolvedValue([{ url: CALENDAR_URL }]);
    createCalendarObject.mockResolvedValue({});
  });

  afterEach(() => jest.clearAllMocks());

  it('keys the event on the server-returned href, not the locally reconstructed url', async () => {
    const serverHref = '/calendars/jane/default/server-assigned.ics';

    fetchEventsByHrefs.mockResolvedValue([
      { id: serverHref, iCalUid: 'whatever' },
    ]);

    const result = await service.createCalendarEvent(
      baseInput,
      connectedAccount,
    );

    expect(createCalendarObject).toHaveBeenCalledTimes(1);
    expect(fetchEventsByHrefs).toHaveBeenCalledWith(client, [
      expect.stringMatching(/^https:\/\/dav\.example\.com\/.*\.ics$/),
    ]);
    expect(result.id).toBe(serverHref);
  });

  it('falls back to the reconstructed href when the server copy is not retrievable', async () => {
    fetchEventsByHrefs.mockResolvedValue([]);

    const result = await service.createCalendarEvent(
      baseInput,
      connectedAccount,
    );

    expect(result.id).toMatch(
      /^https:\/\/dav\.example\.com\/calendars\/jane\/default\/.*\.ics$/,
    );
  });

  it('falls back to the reconstructed href when re-fetch fails, without failing the create', async () => {
    fetchEventsByHrefs.mockRejectedValue(new Error('network'));

    const result = await service.createCalendarEvent(
      baseInput,
      connectedAccount,
    );

    expect(result.id).toMatch(/\.ics$/);
  });

  it('throws when no writable calendar is available', async () => {
    listEventCalendars.mockResolvedValue([]);

    await expect(
      service.createCalendarEvent(baseInput, connectedAccount),
    ).rejects.toThrow(CalendarEventCreationException);
  });
});
