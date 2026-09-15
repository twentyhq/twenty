import { type FindOptionsWhere, LessThan } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STUCK_STOPPING_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/stuck-stopping-runs-threshold';

export const getStuckStoppingRunsFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity> => {
    const thresholdDate = new Date(
      Date.now() - STUCK_STOPPING_RUNS_THRESHOLD_MS,
    );

    return {
      status: WorkflowRunStatus.STOPPING,
      updatedAt: LessThan(thresholdDate.toISOString()),
    };
  };
