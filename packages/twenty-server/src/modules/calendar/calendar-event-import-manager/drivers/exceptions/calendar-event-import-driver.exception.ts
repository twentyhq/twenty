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
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
