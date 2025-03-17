import { RecordCRUDActionExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class RecordCRUDActionException extends CustomException {
  constructor(message: string, code: RecordCRUDActionExceptionCode) {
    super(message, code);
  }
}
