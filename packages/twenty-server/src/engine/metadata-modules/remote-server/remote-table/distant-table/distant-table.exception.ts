import { DistantTableExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class DistantTableException extends CustomException {
  constructor(message: string, code: DistantTableExceptionCode) {
    super(message, code);
  }
}
