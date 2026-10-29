import {
  type QueueJobOptions,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  scope,
}: {
  workflowRunId: string;
  scope: QueueJobScope;
}): QueueJobOptions => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
  ...scope,
});
