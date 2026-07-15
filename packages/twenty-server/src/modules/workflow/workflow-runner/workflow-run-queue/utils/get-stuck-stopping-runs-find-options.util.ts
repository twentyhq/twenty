import { type FindOptionsWhere, LessThan, MoreThan } from 'typeorm';

import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STUCK_STOPPING_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/stuck-stopping-runs-threshold';

export type StuckStoppingRunsCursor = {
  createdAt: string;
  id: string;
};

export const getStuckStoppingRunsFindOptions = (
  cursor?: StuckStoppingRunsCursor,
):
  | FindOptionsWhere<WorkflowRunWorkspaceEntity>
  | FindOptionsWhere<WorkflowRunWorkspaceEntity>[] => {
  const thresholdDate = new Date(Date.now() - STUCK_STOPPING_RUNS_THRESHOLD_MS);

  const base: FindOptionsWhere<WorkflowRunWorkspaceEntity> = {
    status: WorkflowRunStatus.STOPPING,
    updatedAt: LessThan(thresholdDate.toISOString()),
  };

  if (!cursor) {
    return base;
  }

  return [
    { ...base, createdAt: MoreThan(cursor.createdAt) },
    { ...base, createdAt: cursor.createdAt, id: MoreThan(cursor.id) },
  ];
};
