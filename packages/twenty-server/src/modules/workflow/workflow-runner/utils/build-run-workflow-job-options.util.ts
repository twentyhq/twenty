import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  workspaceId,
}: {
  workflowRunId: string;
  workspaceId: string;
}): QueueJobOptions => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
  workspaceId,
  isWorkspaceJob: true,
});
