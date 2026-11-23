import {
  type QueueJobOptions,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { RUN_WORKFLOW_JOB_GROUP_KEY } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-group-key.constant';

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  scope,
}: {
  workflowRunId: string;
  scope: QueueJobScope;
}): QueueJobOptions => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
  groupKey: RUN_WORKFLOW_JOB_GROUP_KEY,
  ...scope,
});
