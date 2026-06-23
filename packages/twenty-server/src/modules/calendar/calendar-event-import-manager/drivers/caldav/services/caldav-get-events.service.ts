import { Injectable, Logger } from '@nestjs/common';

import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { type CalDavSyncCursor } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/types/caldav-sync-cursor';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { type GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';

@Injectable()
export class CalDavGetEventsService {
  private readonly logger = new Logger(CalDavGetEventsService.name);

  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly fetchEventsService: CalDavFetchEventsService,
  ) {}

  async getCalendarEvents(
    connectedAccountId: string,
    syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    this.logger.debug(`Getting calendar events for ${connectedAccountId}`);

    try {
      const client =
        await this.calDavClientProvider.getClient(connectedAccountId);

      const result = await this.fetchEventsService.fetchChangedEventHrefs(
        client,
        syncCursor ? (JSON.parse(syncCursor) as CalDavSyncCursor) : undefined,
      );

      this.logger.debug(
        `Found ${result.eventHrefs.length} changed calendar events for ${connectedAccountId}`,
      );

      return {
        calendarEventIds: result.eventHrefs,
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
