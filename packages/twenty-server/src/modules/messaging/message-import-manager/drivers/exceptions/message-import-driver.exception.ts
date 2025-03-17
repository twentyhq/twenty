import { MessageImportDriverExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class MessageImportDriverException extends CustomException {
  constructor(message: string, code: MessageImportDriverExceptionCode) {
    super(message, code);
  }
}
