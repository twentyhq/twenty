import { CustomException } from 'src/utils/custom-exception';
export class MessagingException extends CustomException {
  code: MessagingExceptionCode;
  constructor(message: string, code: MessagingExceptionCode) {
    super(message, code);
  }
}

export enum MessagingExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
}
