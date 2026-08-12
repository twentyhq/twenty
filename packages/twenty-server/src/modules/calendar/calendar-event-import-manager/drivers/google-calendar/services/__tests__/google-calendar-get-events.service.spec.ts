import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { GoogleCalendarGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/google-calendar/services/google-calendar-get-events.service';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';

const connectedAccount = {
  id: 'account-1',
  provider: ConnectedAccountProvider.GOOGLE,
};

describe('GoogleCalendarGetEventsService', () => {
  let service: GoogleCalendarGetEventsService;
  const list = jest.fn();

  beforeEach(async () => {
    jest
      .spyOn(google, 'calendar')
      .mockReturnValue({ events: { list } } as never);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCalendarGetEventsService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();

    service = module.get(GoogleCalendarGetEventsService);
  });

  afterEach(() => {
    list.mockReset();
    jest.restoreAllMocks();
  });

  it('splits confirmed and cancelled items into ids to import and ids to delete', async () => {
    list.mockResolvedValue({
      data: {
        items: [
          { id: 'event-1', status: 'confirmed' },
          { id: 'event-2', status: 'cancelled' },
        ],
        nextSyncToken: 'sync-token-2',
      },
    });

    const result = await service.getCalendarEvents(
      connectedAccount,
      'sync-token-1',
    );

    expect(result).toEqual({
      calendarEventIds: ['event-1'],
      calendarEventIdsToDelete: ['event-2'],
      nextSyncCursor: 'sync-token-2',
    });
  });

  it('throws a SYNC_CURSOR_ERROR when Google returns 410 for an expired or invalidated sync token', async () => {
    list.mockRejectedValue({
      code: undefined,
      response: {
        status: 410,
        data: {
          error: {
            errors: [
              {
                domain: 'global',
                reason: 'fullSyncRequired',
                message:
                  'Sync token is no longer valid, a full sync is required.',
              },
            ],
          },
        },
      },
    });

    await expect(
      service.getCalendarEvents(connectedAccount, 'stale-sync-token'),
    ).rejects.toMatchObject({
      code: CalendarEventImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    });
    await expect(
      service.getCalendarEvents(connectedAccount, 'stale-sync-token'),
    ).rejects.toBeInstanceOf(CalendarEventImportDriverException);
  });

  it('does not silently return an empty successful page on 410, unlike the pre-fix behavior', async () => {
    list.mockRejectedValue({
      code: undefined,
      response: {
        status: 410,
        data: {
          error: { errors: [{ reason: 'fullSyncRequired', message: '' }] },
        },
      },
    });

    const call = service.getCalendarEvents(
      connectedAccount,
      'stale-sync-token',
    );

    await expect(call).rejects.toBeDefined();
  });

  it('maps a non-410 error through parseGoogleCalendarError instead of swallowing it', async () => {
    list.mockRejectedValue({
      code: undefined,
      response: {
        status: 404,
        data: {
          error: { errors: [{ reason: 'notFound', message: 'not found' }] },
        },
      },
    });

    await expect(
      service.getCalendarEvents(connectedAccount, 'sync-token-1'),
    ).rejects.toMatchObject({
      code: CalendarEventImportDriverExceptionCode.NOT_FOUND,
    });
  });
});
