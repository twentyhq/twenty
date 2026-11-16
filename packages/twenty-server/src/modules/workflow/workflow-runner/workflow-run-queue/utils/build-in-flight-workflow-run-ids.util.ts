import { isNonEmptyString } from '@sniptt/guards';

import { type InFlightQueueJob } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';

const RUN_WORKFLOW_JOB_ID_PATTERN =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-/i;

export const buildInFlightWorkflowRunIds = (
  inFlightJobs: InFlightQueueJob<RunWorkflowJobData>[],
): Set<string> => {
  const workflowRunIds = new Set<string>();

  for (const job of inFlightJobs) {
    if (isNonEmptyString(job.data?.workflowRunId)) {
      workflowRunIds.add(job.data.workflowRunId);
    }

    const workflowRunIdFromJobId = job.id?.match(
      RUN_WORKFLOW_JOB_ID_PATTERN,
    )?.[1];

    if (isNonEmptyString(workflowRunIdFromJobId)) {
      workflowRunIds.add(workflowRunIdFromJobId);
    }
  }

  return workflowRunIds;
};
