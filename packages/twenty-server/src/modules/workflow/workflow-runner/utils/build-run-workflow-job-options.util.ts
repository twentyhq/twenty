import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

// Prefixing job ids with the workflow run id makes queue jobs and worker logs
// traceable back to their run. Deduplication is disabled because a run can
// legitimately dispatch several concurrent jobs (parallel branches, resume,
// retry).
export const buildRunWorkflowJobOptions = (
  workflowRunId: string,
): QueueJobOptions => ({
  id: workflowRunId,
  deduplicate: false,
});
