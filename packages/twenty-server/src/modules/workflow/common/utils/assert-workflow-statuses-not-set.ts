import { msg } from '@lingui/core/macro';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { type WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';

export const assertWorkflowStatusesNotSet = (
  statuses?: WorkflowStatus[] | null,
) => {
  if (statuses) {
    throw new WorkflowQueryValidationException(
      'Statuses cannot be set manually.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        userFriendlyMessage: msg`Statuses cannot be set manually.`,
      },
    );
  }
};
