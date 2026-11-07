import { isDefined } from 'twenty-shared/utils';

import {
  type QueueJobOptions,
  type QueueJobScope,
} from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';

export const buildRunWorkflowJobOptions = ({
  workflowRunId,
  scope,
  groupKeys,
}: {
  workflowRunId: string;
  scope: QueueJobScope;
  groupKeys?: string[];
}): QueueJobOptions => ({
  id: workflowRunId,
  doNotCheckDuplicatesBasedOnPrefix: true,
  ...(isDefined(groupKeys) ? { groupKeys } : {}),
  ...scope,
});
