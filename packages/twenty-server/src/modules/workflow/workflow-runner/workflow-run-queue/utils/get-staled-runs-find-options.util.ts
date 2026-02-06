import { type FindOptionsWhere, IsNull, LessThan, Or } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STALED_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/staled-runs-threshold';

export const getStaledRunsFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity> => {
    const thresholdDate = new Date(Date.now() - STALED_RUNS_THRESHOLD_MS);

    return {
      status: WorkflowRunStatus.ENQUEUED,
      enqueuedAt: Or(LessThan(thresholdDate), IsNull()),
    };
  };
