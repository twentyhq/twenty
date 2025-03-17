import { TwentyORMExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class TwentyORMException extends CustomException {
  constructor(message: string, code: TwentyORMExceptionCode) {
    super(message, code);
  }
}
