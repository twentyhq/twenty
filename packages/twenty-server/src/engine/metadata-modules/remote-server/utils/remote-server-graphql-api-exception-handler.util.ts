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
import { CustomException } from 'src/utils/custom-exception';

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
      default:
        throw new CustomException(error.message, error.code);
    }
  }

  throw error;
};
