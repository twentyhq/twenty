import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

export const serverlessFunctionGraphQLApiExceptionHandler = (error: any) => {
  if (error instanceof ServerlessFunctionException) {
    switch (error.code) {
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND:
        throw new NotFoundError(error.message);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST:
        throw new ConflictError(error.message);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_READY:
      case ServerlessFunctionExceptionCode.FEATURE_FLAG_INVALID:
        throw new ForbiddenError(error.message);
      default:
        throw new InternalServerError(error.message);
    }
  }
  throw error;
};
