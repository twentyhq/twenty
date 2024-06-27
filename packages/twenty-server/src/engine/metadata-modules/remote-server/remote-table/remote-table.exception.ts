import {
  NotFoundError,
  UserInputError,
  ConflictError,
  InternalServerError,
} from 'src/engine/utils/graphql-errors.util';
import { CustomError } from 'src/utils/custom-error';

export class RemoteTableException extends CustomError {
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

export const remoteTableExceptionHandler = (error: Error) => {
  if (error instanceof RemoteTableException) {
    switch (error.code) {
      case RemoteTableExceptionCode.REMOTE_TABLE_NOT_FOUND:
      case RemoteTableExceptionCode.NO_OBJECT_METADATA_FOUND:
      case RemoteTableExceptionCode.NO_FOREIGN_TABLES_FOUND:
      case RemoteTableExceptionCode.NO_FIELD_METADATA_FOUND:
        throw new NotFoundError(error.message);
      case RemoteTableExceptionCode.INVALID_REMOTE_TABLE_INPUT:
        throw new UserInputError(error.message);
      case RemoteTableExceptionCode.REMOTE_TABLE_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }

  throw error;
};
