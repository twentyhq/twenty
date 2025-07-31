import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportDriverException extends CustomException<CalendarEventImportDriverExceptionCode> {}

export enum CalendarEventImportDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  UNKNOWN_NETWORK_ERROR = 'UNKNOWN_NETWORK_ERROR',
}
