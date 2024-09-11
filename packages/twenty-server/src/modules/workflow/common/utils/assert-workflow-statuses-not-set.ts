import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export const assertWorkflowStatusesNotSet = (
  statuses?: WorkflowStatus[] | null,
) => {
  if (statuses) {
    throw new WorkflowQueryValidationException(
      'Statuses cannot be set manually.',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
};
