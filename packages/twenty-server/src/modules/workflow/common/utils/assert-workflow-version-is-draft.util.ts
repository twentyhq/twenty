import { msg } from '@lingui/core/macro';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export const assertWorkflowVersionIsDraft = (
  workflowVersion: WorkflowVersionWorkspaceEntity,
) => {
  if (workflowVersion.status !== WorkflowVersionStatus.DRAFT) {
    throw new WorkflowQueryValidationException(
      'Workflow version is not in draft status',
      WorkflowQueryValidationExceptionCode.FORBIDDEN,
      {
        userFriendlyMessage: msg`Workflow version is not in draft status`,
      },
    );
  }
};
