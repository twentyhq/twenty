import { CustomException } from 'src/utils/custom-exception';

export class RemoteTableException extends CustomException {
  code: RemoteTableExceptionCode;
  constructor(message: string, code: RemoteTableExceptionCode) {
    super(message, code);
  }
}

export enum RemoteTableExceptionCode {
  REMOTE_TABLE_NOT_FOUND = 'REMOTE_TABLE_NOT_FOUND',
  INVALID_REMOTE_TABLE_INPUT = 'INVALID_REMOTE_TABLE_INPUT',
  REMOTE_TABLE_ALREADY_EXISTS = 'REMOTE_TABLE_ALREADY_EXISTS',
  NO_FOREIGN_TABLES_FOUND = 'NO_FOREIGN_TABLES_FOUND',
  NO_OBJECT_METADATA_FOUND = 'NO_OBJECT_METADATA_FOUND',
  NO_FIELD_METADATA_FOUND = 'NO_FIELD_METADATA_FOUND',
}
