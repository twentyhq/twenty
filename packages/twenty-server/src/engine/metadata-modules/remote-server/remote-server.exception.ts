import { RemoteServerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class RemoteServerException extends CustomException {
  constructor(message: string, code: RemoteServerExceptionCode) {
    super(message, code);
  }
}
