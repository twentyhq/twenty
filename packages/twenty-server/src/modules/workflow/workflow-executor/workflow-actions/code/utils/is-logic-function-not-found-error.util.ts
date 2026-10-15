import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
} from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const isLogicFunctionNotFoundError = (error: unknown): boolean =>
  (error instanceof LogicFunctionException &&
    error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND) ||
  (error instanceof LogicFunctionExecutionException &&
    error.code ===
      LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND);
