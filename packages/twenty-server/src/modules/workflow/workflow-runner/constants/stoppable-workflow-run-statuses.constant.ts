import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

export const STOPPABLE_WORKFLOW_RUN_STATUSES = [
  WorkflowRunStatus.NOT_STARTED,
  WorkflowRunStatus.ENQUEUED,
  WorkflowRunStatus.RUNNING,
];
