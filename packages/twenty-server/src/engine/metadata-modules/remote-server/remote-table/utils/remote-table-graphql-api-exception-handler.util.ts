import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RemoteTableException,
  RemoteTableExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.exception';

export const remoteTableGraphqlApiExceptionHandler = (error: Error) => {
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
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
