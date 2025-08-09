import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RemoteServerException,
  RemoteServerExceptionCode,
} from 'src/engine/metadata-modules/remote-server/remote-server.exception';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const remoteServerGraphqlApiExceptionHandler = (error: any) => {
  if (error instanceof RemoteServerException) {
    switch (error.code) {
      case RemoteServerExceptionCode.REMOTE_SERVER_NOT_FOUND:
        throw new NotFoundError(error.message);
      case RemoteServerExceptionCode.INVALID_REMOTE_SERVER_INPUT:
        throw new UserInputError(error.message);
      case RemoteServerExceptionCode.REMOTE_SERVER_MUTATION_NOT_ALLOWED:
        throw new ForbiddenError(error.message);
      case RemoteServerExceptionCode.REMOTE_SERVER_ALREADY_EXISTS:
        throw new ConflictError(error.message);
      case RemoteServerExceptionCode.REMOTE_SERVER_CONNECTION_ERROR:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
