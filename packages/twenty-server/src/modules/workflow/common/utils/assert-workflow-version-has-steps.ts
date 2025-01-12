import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export function assertWorkflowVersionHasSteps(
  workflowVersion: WorkflowVersionWorkspaceEntity,
): asserts workflowVersion is WorkflowVersionWorkspaceEntity & {
  steps: WorkflowAction[];
} {
  if (workflowVersion.steps === null || workflowVersion.steps.length < 1) {
    throw new WorkflowTriggerException(
      'Workflow version does not contain at least one step',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }
}
