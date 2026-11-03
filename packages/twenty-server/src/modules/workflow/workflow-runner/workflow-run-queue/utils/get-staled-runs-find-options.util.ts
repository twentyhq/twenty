import { type FindOptionsWhere, IsNull, LessThan, Or } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STALED_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/staled-runs-threshold';

// A NOT_STARTED run never got a job: nothing creates them any more, but older rows can remain
export const getStaledRunsFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity>[] => {
    const thresholdDate = new Date(Date.now() - STALED_RUNS_THRESHOLD_MS);

    return [
      { status: WorkflowRunStatus.NOT_STARTED },
      {
        status: WorkflowRunStatus.ENQUEUED,
        enqueuedAt: Or(LessThan(thresholdDate), IsNull()),
      },
    ];
  };
