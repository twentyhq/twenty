import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalDavClientService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-client.service';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { type CalDavSyncCursor } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-sync-cursor';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';

@Injectable()
export class CalDavGetEventsService {
  private readonly logger = new Logger(CalDavGetEventsService.name);

  private static readonly PAST_DAYS_WINDOW = 365 * 5;
  private static readonly FUTURE_DAYS_WINDOW = 365;

  constructor(
    private readonly clientService: CalDavClientService,
    private readonly fetchEventsService: CalDavFetchEventsService,
  ) {}

  async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountEntity,
      'provider' | 'id' | 'connectionParameters' | 'handle'
    >,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    this.logger.debug(`Getting calendar events for ${connectedAccount.handle}`);

    try {
      const params = connectedAccount.connectionParameters?.CALDAV;

      if (
        !isNonEmptyString(params?.host) ||
        !isNonEmptyString(params?.password) ||
        !isDefined(connectedAccount.handle)
      ) {
        throw new Error('Missing required CalDAV connection parameters');
      }

      const client = await this.clientService.getClient({
        serverUrl: params.host,
        username: params.username ?? connectedAccount.handle,
        password: params.password,
      });

      const startDate = new Date(
        Date.now() -
          CalDavGetEventsService.PAST_DAYS_WINDOW * 24 * 60 * 60 * 1000,
      );
      const endDate = new Date(
        Date.now() +
          CalDavGetEventsService.FUTURE_DAYS_WINDOW * 24 * 60 * 60 * 1000,
      );

      const result = await this.fetchEventsService.fetchEvents(client, {
        startDate,
        endDate,
        syncCursor: syncCursor
          ? (JSON.parse(syncCursor) as CalDavSyncCursor)
          : undefined,
      });

      this.logger.debug(
        `Found ${result.events.length} calendar events for ${connectedAccount.handle}`,
      );

      return {
        fullEvents: true,
        calendarEvents: result.events,
        nextSyncCursor: JSON.stringify(result.syncCursor),
      };
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavGetEventsService.name} - getCalendarEvents`,
        error,
      );

      throw parseCalDAVError(error as Error);
    }
  }
}
