export enum CalendarEventErrorCode {
  UNKNOWN = 'UNKNOWN',
}

export interface CalendarEventError {
  message: string;
  code: CalendarEventErrorCode;
}
