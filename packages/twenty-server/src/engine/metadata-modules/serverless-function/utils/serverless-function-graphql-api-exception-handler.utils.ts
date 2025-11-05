import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const serverlessFunctionGraphQLApiExceptionHandler = (error: any) => {
  if (error instanceof ServerlessFunctionException) {
    switch (error.code) {
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND:
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_VERSION_NOT_FOUND:
        throw new NotFoundError(error);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_ALREADY_EXIST:
        throw new ConflictError(error);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_READY:
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_BUILDING:
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_LIMIT_REACHED:
        throw new ForbiddenError(error);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_EXECUTION_TIMEOUT:
        throw new TimeoutError(error);
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CODE_UNCHANGED:
      case ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CREATE_FAILED:
        throw error;
      default: {
        return assertUnreachable(error.code);
      }
    }
  }
  throw error;
};
