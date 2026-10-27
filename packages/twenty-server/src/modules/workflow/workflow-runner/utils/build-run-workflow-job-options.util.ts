import { type QueueJobSettings } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobOptions = (
  workflowRunId: string,
): QueueJobSettings => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
});
