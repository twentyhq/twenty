import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

const buildService = () => {
  const calendarChannel = {
    connectedAccount: {
      provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
      archivedAt: null,
      scopes: null,
    },
  };

  const calendarChannelRepository = {
    find: jest.fn().mockResolvedValue([calendarChannel]),
  } as unknown as Repository<CalendarChannelEntity>;

  return new CalendarEventComposerService(
    {} as Repository<ConnectedAccountEntity>,
    calendarChannelRepository,
  );
};

const composeWithTimeZone = (timeZone: string | undefined) =>
  buildService().composeCalendarEvent(
    {
      title: 'Kickoff',
      startsAt: '2026-07-01T15:00:00Z',
      endsAt: '2026-07-01T16:00:00Z',
      timeZone,
    },
    WORKSPACE_ID,
  );

describe('CalendarEventComposerService', () => {
  it('should default to UTC when no time zone is provided', async () => {
    const result = await composeWithTimeZone(undefined);

    expect(result.success && result.data.input.timeZone).toBe('UTC');
  });

  it('should default to UTC when the time zone is an empty string', async () => {
    const result = await composeWithTimeZone('');

    expect(result.success && result.data.input.timeZone).toBe('UTC');
  });

  it('should keep a provided time zone', async () => {
    const result = await composeWithTimeZone('Europe/Paris');

    expect(result.success && result.data.input.timeZone).toBe('Europe/Paris');
  });

  it('should reject an invalid time zone', async () => {
    const result = await composeWithTimeZone('Not/AZone');

    expect(result).toEqual({
      success: false,
      error: "timeZone 'Not/AZone' is not a valid IANA time zone",
    });
  });
});
