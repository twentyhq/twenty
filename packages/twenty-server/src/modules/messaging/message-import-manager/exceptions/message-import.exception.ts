import { MessageImportExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class MessageImportException extends CustomException {
  constructor(message: string, code: MessageImportExceptionCode) {
    super(message, code);
  }
}
