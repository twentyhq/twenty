import { type FindOptionsWhere, In, LessThan } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RUNS_TO_CLEAN_THRESHOLD_DAYS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/runs-to-clean-threshold';

export const getRunsToCleanFindOptions =
  (): FindOptionsWhere<WorkflowRunWorkspaceEntity> => {
    const thresholdDate = new Date(
      Date.now() - RUNS_TO_CLEAN_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      status: In([WorkflowRunStatus.COMPLETED, WorkflowRunStatus.FAILED]),
      createdAt: LessThan(thresholdDate),
    };
  };
