import { msg } from '@lingui/core/macro';

import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export function assertWorkflowVersionTriggerIsDefined(
  workflowVersion: WorkflowVersionWorkspaceEntity,
): asserts workflowVersion is Omit<
  WorkflowVersionWorkspaceEntity,
  'trigger'
> & {
  trigger: WorkflowTrigger;
} {
  if (!workflowVersion.trigger) {
    throw new WorkflowTriggerException(
      'Workflow version does not contain trigger',
      WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      {
        userFriendlyMessage: msg`Workflow version does not contain trigger`,
      },
    );
  }
}
