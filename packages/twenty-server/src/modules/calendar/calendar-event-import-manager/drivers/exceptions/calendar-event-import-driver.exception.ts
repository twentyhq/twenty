import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportDriverException extends CustomException {
  code: CalendarEventImportDriverExceptionCode;
  constructor(message: string, code: CalendarEventImportDriverExceptionCode) {
    super(message, code);
  }
}

export enum CalendarEventImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
}
