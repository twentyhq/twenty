import { Injectable } from '@nestjs/common';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { isMicrosoftClientTemporaryError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/is-temporary-error.utils';

@Injectable()
export class MicrosoftCalendarNetworkErrorHandler {
  // oxlint-disable-next-line typescript/no-explicit-any
  public handleError(error: any): CalendarEventImportDriverException | null {
    const isBodyString = error.body && typeof error.body === 'string';
    const isTemporaryError =
      isBodyString && isMicrosoftClientTemporaryError(error.body);

    if (isTemporaryError) {
      return new CalendarEventImportDriverException(
        `code: ${error.code} - body: ${error.body}`,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    return null;
  }
}
