import {
  WorkflowQueryHookException,
  WorkflowQueryHookExceptionCode,
} from 'src/modules/workflow/common/query-hooks/workflow-query-hook.exception';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export const assertWorkflowStatusesNotSetOrEmpty = (
  statuses?: WorkflowStatus[] | null,
) => {
  if (statuses && statuses.length > 0) {
    throw new WorkflowQueryHookException(
      'Statuses cannot be set manually.',
      WorkflowQueryHookExceptionCode.FORBIDDEN,
    );
  }
};
