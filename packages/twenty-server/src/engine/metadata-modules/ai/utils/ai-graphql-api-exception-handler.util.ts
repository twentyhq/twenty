import { assertUnreachable } from 'twenty-shared/utils';

import { BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { billingGraphqlApiExceptionHandler } from 'src/engine/core-modules/billing/utils/billing-graphql-api-exception-handler.util';
import {
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const aiGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof BillingException) {
    return billingGraphqlApiExceptionHandler(error);
  }

  if (error instanceof AiException) {
    switch (error.code) {
      case AiExceptionCode.AGENT_NOT_FOUND:
      case AiExceptionCode.THREAD_NOT_FOUND:
      case AiExceptionCode.WORKSPACE_NOT_FOUND:
      case AiExceptionCode.MESSAGE_NOT_FOUND:
      case AiExceptionCode.ROLE_NOT_FOUND:
        throw new NotFoundError(error);
      case AiExceptionCode.CONTEXT_WINDOW_EXCEEDED:
      case AiExceptionCode.INVALID_AGENT_INPUT:
      case AiExceptionCode.INVALID_CHAT_THREAD_TITLE:
      case AiExceptionCode.QUESTION_NOT_PENDING:
      case AiExceptionCode.INVALID_QUESTION_ANSWER:
        throw new UserInputError(error);
      case AiExceptionCode.AGENT_ALREADY_EXISTS:
      case AiExceptionCode.NO_FAILED_TURN_TO_RETRY:
        throw new ConflictError(error);
      case AiExceptionCode.AGENT_IS_STANDARD:
      case AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
        throw new ForbiddenError(error);
      case AiExceptionCode.AGENT_EXECUTION_FAILED:
      case AiExceptionCode.API_KEY_NOT_CONFIGURED:
      case AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
      case AiExceptionCode.STREAM_INTERRUPTED:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
