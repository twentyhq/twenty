import { Injectable, Logger } from '@nestjs/common';

import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { type FetchedCalendarEvent } from 'src/modules/calendar/common/types/fetched-calendar-event';

@Injectable()
export class CalDavImportEventsService {
  private readonly logger = new Logger(CalDavImportEventsService.name);

  constructor(
    private readonly calDavClientProvider: CalDavClientProvider,
    private readonly fetchEventsService: CalDavFetchEventsService,
  ) {}

  async getCalendarEvents(
    connectedAccountId: string,
    eventExternalIds: string[],
  ): Promise<FetchedCalendarEvent[]> {
    this.logger.debug(
      `Importing ${eventExternalIds.length} calendar events for ${connectedAccountId}`,
    );

    try {
      const client =
        await this.calDavClientProvider.getClient(connectedAccountId);

      return await this.fetchEventsService.fetchEventsByHrefs(
        client,
        eventExternalIds,
      );
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavImportEventsService.name} - getCalendarEvents`,
        error,
      );

      throw parseCalDAVError(error as Error);
    }
  }
}
