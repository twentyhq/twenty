import { CustomException } from 'src/utils/custom-exception';

export class CalendarException extends CustomException {
  code: CalendarExceptionCode;
  constructor(message: string, code: CalendarExceptionCode) {
    super(message, code);
  }
}

export enum CalendarExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
