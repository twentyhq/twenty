import { isDefined } from 'twenty-shared/utils';

// Agent history records carry every workspace column, including the run link
// the legacy thread entity type does not declare.
export const isWorkflowRunThread = (thread: object): boolean =>
  'workflowRunId' in thread && isDefined(thread.workflowRunId);
