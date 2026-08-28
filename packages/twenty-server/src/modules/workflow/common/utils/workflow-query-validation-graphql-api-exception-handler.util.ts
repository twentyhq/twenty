import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

export const workflowQueryValidationGraphqlApiExceptionHandler = (
  exception: WorkflowQueryValidationException,
) => {
  switch (exception.code) {
    case WorkflowQueryValidationExceptionCode.FORBIDDEN:
      throw new ForbiddenError(exception);
    case WorkflowQueryValidationExceptionCode.INVALID_WORKFLOW_VERSION:
      throw new UserInputError(exception);
    default: {
      assertUnreachable(exception.code);
    }
  }
};
