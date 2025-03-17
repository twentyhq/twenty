import { SendEmailActionExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class SendEmailActionException extends CustomException {
  constructor(message: string, code: SendEmailActionExceptionCode) {
    super(message, code);
  }
}
