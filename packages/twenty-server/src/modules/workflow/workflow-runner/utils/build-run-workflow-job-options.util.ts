import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobOptions = (
  workflowRunId: string,
): QueueJobOptions => ({
  id: workflowRunId,
  allowDuplicatedPrefixes: true,
});
