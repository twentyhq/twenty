import { CustomException } from 'src/utils/custom-exception';

export class SendEmailActionException extends CustomException {
  constructor(message: string, code: SendEmailActionExceptionCode) {
    super(message, code);
  }
}

export enum SendEmailActionExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_CONNECTED_ACCOUNT_ID = 'INVALID_CONNECTED_ACCOUNT_ID',
}
