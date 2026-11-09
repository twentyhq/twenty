import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type RunWorkflowJobTarget } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-target.type';

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  scope,
}: {
  workflowRunId: string;
  scope: RunWorkflowJobTarget;
}): QueueJobOptions => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
  ...scope,
});
