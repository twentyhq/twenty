import { CustomException } from 'src/utils/custom-exception';

export class CalendarEventImportException extends CustomException<CalendarEventImportExceptionCode> {}

export enum CalendarEventImportExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}
