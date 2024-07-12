export enum CalendarEventErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
}

export interface CalendarEventError {
  message: string;
  code: CalendarEventErrorCode;
}
