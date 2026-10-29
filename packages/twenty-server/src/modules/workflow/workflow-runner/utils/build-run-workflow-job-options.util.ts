import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import {
  type QueueJobOptions,
  type QueueJobSettings,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobSettings = (
  workflowRunId: string,
): QueueJobSettings => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
});

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  workspaceId,
}: {
  workflowRunId: string;
  workspaceId: string;
}): QueueJobOptions => ({
  ...buildRunWorkflowJobSettings(workflowRunId),
  workspaceId,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
});
