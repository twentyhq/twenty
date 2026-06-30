import { Logger } from '@nestjs/common';

import { type GaxiosError } from 'gaxios';

import {
  CalendarEventImportDriverException,
  CalendarEventImportDriverExceptionCode,
} from 'src/modules/calendar/calendar-event-import-manager/drivers/exceptions/calendar-event-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';

export const parseGaxiosError = (
  error: GaxiosError,
): CalendarEventImportDriverException => {
  const logger = new Logger(parseGaxiosError.name);
  const { code } = error;

  switch (code) {
    case MessageNetworkExceptionCode.ECONNRESET:
    case MessageNetworkExceptionCode.ENOTFOUND:
    case MessageNetworkExceptionCode.ECONNABORTED:
    case MessageNetworkExceptionCode.ETIMEDOUT:
    case MessageNetworkExceptionCode.ERR_NETWORK:
      return new CalendarEventImportDriverException(
        error.message,
        CalendarEventImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    default:
      logger.error(error);

      return new CalendarEventImportDriverException(
        error.message,
        CalendarEventImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
      );
  }
};
