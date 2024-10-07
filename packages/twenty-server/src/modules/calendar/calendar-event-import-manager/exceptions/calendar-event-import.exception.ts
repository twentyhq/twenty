import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportException extends CustomException {
  code: CalendarEventImportExceptionCode;
  constructor(message: string, code: CalendarEventImportExceptionCode) {
    super(message, code);
  }
}

export enum CalendarEventImportExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
  CALENDAR_CHANNEL_NOT_FOUND = 'CALENDAR_CHANNEL_NOT_FOUND',
}
