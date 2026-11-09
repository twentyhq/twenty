import { type InFlightQueueJob } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';

export const hasInFlightRunWorkflowJob = ({
  inFlightJobs,
  workflowRunId,
}: {
  inFlightJobs: InFlightQueueJob<RunWorkflowJobData>[];
  workflowRunId: string;
}): boolean =>
  inFlightJobs.some(
    (job) =>
      job.id?.startsWith(`${workflowRunId}-`) ||
      job.data?.workflowRunId === workflowRunId,
  );
