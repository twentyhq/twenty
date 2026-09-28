import { isDefined } from 'twenty-shared/utils';

export type WorkflowRunThreadFields = {
  workflowRunId: string;
  workflowStepId?: string | null;
};

// Agent history records carry every workspace column, including the run link
// the legacy thread entity type does not declare.
export const isWorkflowRunThread = <TThread extends object>(
  thread: TThread,
): thread is TThread & WorkflowRunThreadFields =>
  'workflowRunId' in thread && isDefined(thread.workflowRunId);
