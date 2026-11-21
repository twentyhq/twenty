import { type FindOptionsWhere, IsNull, LessThan, Or, Raw } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STALED_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/staled-runs-threshold';

// A NOT_STARTED run never got a job: production no longer creates them, but old rows and dev seeding leave some
// Compared as text because workspaces that ran the dropped 2.61 command lack the enum value until it is restored
export const getStaledRunsFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity>[] => {
    const thresholdDate = new Date(Date.now() - STALED_RUNS_THRESHOLD_MS);

    return [
      {
        status: Raw(
          (columnAlias) => `${columnAlias}::text = :notStartedStatus`,
          {
            notStartedStatus: WorkflowRunStatus.NOT_STARTED,
          },
        ),
      },
      {
        status: WorkflowRunStatus.ENQUEUED,
        enqueuedAt: Or(LessThan(thresholdDate), IsNull()),
      },
    ];
  };
