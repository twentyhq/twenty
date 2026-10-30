import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SetuAiTaskException } from 'src/engine/metadata-modules/ai/ai-tasks/setu-ai-task.exception';

export const setuAiTaskGraphqlApiExceptionHandler = (error: Error) => {
  if (error instanceof SetuAiTaskException) {
    switch (error.code) {
      case 'INVALID_INPUT':
      case 'UNSUPPORTED_ACTION':
        throw new UserInputError(error);
      case 'STALE_VERSION':
      case 'NOT_REVIEWABLE':
        throw new ConflictError(error);
      case 'BUDGET_EXHAUSTED':
      case 'MODEL_UNAVAILABLE':
        throw new ForbiddenError(error);
      default:
        throw new NotFoundError(error);
    }
  }

  throw error;
};
