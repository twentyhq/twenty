import { Injectable, Logger } from '@nestjs/common';

import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { parseCalDAVError } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/utils/parse-caldav-error.util';
import { GetCalendarEventsResponse } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-get-events.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class CalDavCalendarGetEventsService {
  private readonly logger = new Logger(CalDavCalendarGetEventsService.name);

  constructor(
    private readonly caldavCalendarClientProvider: CalDavClientProvider,
  ) {}

  public async getCalendarEvents(
    connectedAccount: Pick<
      ConnectedAccountWorkspaceEntity,
      'provider' | 'id' | 'connectionParameters' | 'handle'
    >,
    _syncCursor?: string,
  ): Promise<GetCalendarEventsResponse> {
    this.logger.log(`Getting calendar events for ${connectedAccount.handle}`);

    try {
      const caldavCalendarClient =
        await this.caldavCalendarClientProvider.getCalDavCalendarClient(
          connectedAccount,
        );

      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const caldavEvents = await caldavCalendarClient.getAllEvents(
        startDate,
        endDate,
      );

      this.logger.log(
        `Found ${caldavEvents.length} calendar events for ${connectedAccount.handle}`,
      );

      return {
        fullEvents: true,
        calendarEvents: caldavEvents,
        nextSyncCursor: '',
      };
    } catch (error) {
      this.logger.error(
        `Error in ${CalDavCalendarGetEventsService.name} - getCalendarEvents`,
        error,
      );
      throw this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    this.logger.error(
      `Error in ${CalDavCalendarGetEventsService.name} - getCalendarEvents`,
      error,
    );

    throw parseCalDAVError(error);
  }
}
