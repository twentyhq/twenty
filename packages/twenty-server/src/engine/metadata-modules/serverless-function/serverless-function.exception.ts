import { ServerlessFunctionExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ServerlessFunctionException extends CustomException {
  constructor(message: string, code: ServerlessFunctionExceptionCode) {
    super(message, code);
  }
}
