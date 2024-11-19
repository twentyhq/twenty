import { CustomException } from 'src/utils/custom-exception';

export class RecordCRUDActionException extends CustomException {
  code: RecordCRUDActionExceptionCode;
  constructor(message: string, code: RecordCRUDActionExceptionCode) {
    super(message, code);
  }
}

export enum RecordCRUDActionExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
}
