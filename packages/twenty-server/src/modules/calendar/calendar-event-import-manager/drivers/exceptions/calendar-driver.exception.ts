import { CustomException } from 'src/utils/custom-exception';

export class CalendarDriverException extends CustomException {
  code: CalendarDriverExceptionCode;
  constructor(message: string, code: CalendarDriverExceptionCode) {
    super(message, code);
  }
}

export enum CalendarDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
