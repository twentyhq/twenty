import { ForeignTableExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class ForeignTableException extends CustomException {
  constructor(message: string, code: ForeignTableExceptionCode) {
    super(message, code);
  }
}
