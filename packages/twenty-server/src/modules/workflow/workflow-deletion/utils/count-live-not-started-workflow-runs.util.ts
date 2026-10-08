import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const countLiveNotStartedWorkflowRuns = (
  workflowRuns: Pick<WorkflowRunWorkspaceEntity, 'status' | 'deletedAt'>[],
): number =>
  workflowRuns.filter(
    ({ status, deletedAt }) =>
      status === WorkflowRunStatus.NOT_STARTED && !isDefined(deletedAt),
  ).length;
