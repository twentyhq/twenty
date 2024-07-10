export enum CalendarEventErrorCode {
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
}

export interface CalendarEventError {
  message: string;
  code: CalendarEventErrorCode;
}
