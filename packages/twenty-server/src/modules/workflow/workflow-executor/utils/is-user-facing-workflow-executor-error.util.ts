import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

const USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES = [
  WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
  WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
  WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
  WorkflowStepExecutorExceptionCode.FORBIDDEN,
];

// Author misconfigurations: no retry produces a model, and reporting them as system errors buries real ones.
// API_KEY_NOT_CONFIGURED is what an instance with no provider raises via getDefaultModelForTier, and
// INVALID_AGENT_INPUT what a malformed agent or inbox input raises, such as a call that cannot be proposed.
const USER_FACING_AI_EXCEPTION_CODES = [
  AiExceptionCode.API_KEY_NOT_CONFIGURED,
  AiExceptionCode.INVALID_AGENT_INPUT,
  AiExceptionCode.EVALUATION_MODEL_NOT_FOUND,
  AiExceptionCode.EVALUATION_QUESTION_UNSUPPORTED,
  AiExceptionCode.INVALID_EVALUATION_REQUEST,
];

export const isUserFacingWorkflowExecutorError = (error: unknown): boolean => {
  if (error instanceof WorkflowStepExecutorException) {
    return USER_FACING_STEP_EXECUTOR_EXCEPTION_CODES.includes(error.code);
  }

  if (isUsageRefusedError(error)) {
    return true;
  }

  if (error instanceof AiException) {
    return USER_FACING_AI_EXCEPTION_CODES.includes(error.code);
  }

  if (error instanceof LogicFunctionException) {
    return error.code === LogicFunctionExceptionCode.LOGIC_FUNCTION_FORBIDDEN;
  }

  return false;
};
