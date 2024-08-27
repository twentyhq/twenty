import { CustomException } from 'src/utils/custom-exception';

export class MessagingDriverException extends CustomException {
  code: MessagingDriverExceptionCode;
  constructor(message: string, code: MessagingDriverExceptionCode) {
    super(message, code);
  }
}

export enum MessagingDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
