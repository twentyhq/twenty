export enum CalendarEventErrorCode {
  UNKNOWN = 'UNKNOWN',
}

export type CalendarEventError = {
  message: string;
  code: CalendarEventErrorCode;
};
