import { isDefined } from 'twenty-shared/utils';

import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionExecutionResultDTO } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';

export const fromLogicFunctionExecuteResultToDTO = (
  result: LogicFunctionExecuteResult,
): LogicFunctionExecutionResultDTO => ({
  data: result.data as LogicFunctionExecutionResultDTO['data'],
  logs: result.logs,
  duration: result.duration,
  status: result.status,
  error: isDefined(result.error)
    ? {
        errorType: result.error.errorType,
        errorMessage: result.error.errorMessage,
        stackTrace: Array.isArray(result.error.stackTrace)
          ? result.error.stackTrace.join('\n')
          : result.error.stackTrace,
      }
    : undefined,
});
