import { RemoteTableExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class RemoteTableException extends CustomException {
  constructor(message: string, code: RemoteTableExceptionCode) {
    super(message, code);
  }
}
