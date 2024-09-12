import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const assertWorkflowVersionIsDraft = (
  workflowVersion: Omit<WorkflowVersionWorkspaceEntity, 'trigger'> & {
    trigger: WorkflowTrigger;
  },
) => {
  if (workflowVersion.status !== WorkflowVersionStatus.DRAFT) {
    throw new WorkflowQueryValidationException(
      'Workflow version is not in draft status',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
    );
  }
};
