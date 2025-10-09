import { CustomException } from 'src/utils/custom-exception';

export class RecordCRUDActionException extends CustomException<RecordCRUDActionExceptionCode> {}

export enum RecordCRUDActionExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RECORD_CREATION_FAILED = 'RECORD_CREATION_FAILED',
  RECORD_UPDATE_FAILED = 'RECORD_UPDATE_FAILED',
  RECORD_DELETION_FAILED = 'RECORD_DELETION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
}
