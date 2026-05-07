import { assertUnreachable } from 'twenty-shared/utils';

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
  if (error instanceof AiException) {
    switch (error.code) {
      case AiExceptionCode.AGENT_NOT_FOUND:
      case AiExceptionCode.THREAD_NOT_FOUND:
      case AiExceptionCode.MESSAGE_NOT_FOUND:
      case AiExceptionCode.ROLE_NOT_FOUND:
        throw new NotFoundError(error);
      case AiExceptionCode.INVALID_AGENT_INPUT:
      case AiExceptionCode.INVALID_CHAT_THREAD_TITLE:
        throw new UserInputError(error);
      case AiExceptionCode.AGENT_ALREADY_EXISTS:
        throw new ConflictError(error);
      case AiExceptionCode.AGENT_IS_STANDARD:
      case AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS:
        throw new ForbiddenError(error);
      case AiExceptionCode.AGENT_EXECUTION_FAILED:
      case AiExceptionCode.API_KEY_NOT_CONFIGURED:
      case AiExceptionCode.USER_WORKSPACE_ID_NOT_FOUND:
        throw new InternalServerError(error);
      default: {
        return assertUnreachable(error.code);
      }
    }
  }

  throw error;
};
