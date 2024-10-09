import { CustomException } from 'src/utils/custom-exception';

export class MailSenderException extends CustomException {
  code: MailSenderExceptionCode;
  constructor(message: string, code: MailSenderExceptionCode) {
    super(message, code);
  }
}

export enum MailSenderExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
}
