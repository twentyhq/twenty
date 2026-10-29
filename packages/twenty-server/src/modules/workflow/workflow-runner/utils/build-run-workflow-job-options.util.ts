import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

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
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});
