import { Injectable, Logger } from '@nestjs/common';

import { MicrosoftCalendarNetworkErrorHandler } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/services/microsoft-calendar-network-error-handler.service';
import { parseMicrosoftCalendarError } from 'src/modules/calendar/calendar-event-import-manager/drivers/microsoft-calendar/utils/parse-microsoft-calendar-error.util';

@Injectable()
export class MicrosoftCalendarEventsImportErrorHandler {
  private readonly logger = new Logger(
    MicrosoftCalendarEventsImportErrorHandler.name,
  );

  constructor(
    private readonly microsoftCalendarNetworkErrorHandler: MicrosoftCalendarNetworkErrorHandler,
  ) {}

  // oxlint-disable-next-line typescript/no-explicit-any
  public handleError(error: any): never {
    this.logger.error(
      `Error fetching calendar events: ${JSON.stringify(error)}`,
    );

    const networkError =
      this.microsoftCalendarNetworkErrorHandler.handleError(error);

    if (networkError) {
      throw networkError;
    }

    throw parseMicrosoftCalendarError(error);
  }
}
