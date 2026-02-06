import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TimeoutError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logicFunctionGraphQLApiExceptionHandler = (error: any) => {
  if (error instanceof LogicFunctionException) {
    switch (error.code) {
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
        throw new NotFoundError(error);
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_ALREADY_EXIST:
        throw new ConflictError(error);
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_READY:
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_BUILDING:
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED:
        throw new ForbiddenError(error);
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_TIMEOUT:
        throw new TimeoutError(error);
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_CODE_UNCHANGED:
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED:
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_INVALID_SEED_PROJECT:
        throw error;
      case LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED:
        throw new ForbiddenError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }
  throw error;
};
