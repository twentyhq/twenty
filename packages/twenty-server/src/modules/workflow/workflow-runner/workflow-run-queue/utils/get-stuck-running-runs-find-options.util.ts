import { type FindOptionsWhere, LessThan } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STUCK_RUNNING_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/stuck-running-runs-threshold';

export const getStuckRunningRunsFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity> => {
    const thresholdDate = new Date(
      Date.now() - STUCK_RUNNING_RUNS_THRESHOLD_MS,
    );

    return {
      status: WorkflowRunStatus.RUNNING,
      updatedAt: LessThan(thresholdDate.toISOString()),
    };
  };
