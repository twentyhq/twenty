import { Injectable, Logger } from '@nestjs/common';

import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav-client.provider';
import { CalDavFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-fetch-events.service';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { CalendarEventImportDriverException } from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
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

      if (error instanceof CalendarEventImportDriverException) {
        throw error;
      }

      throw parseCalDAVError(error as Error);
    }
  }
}
