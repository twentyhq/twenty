import { isDefined } from 'twenty-shared/utils';

import { type WorkflowTriggerJobData } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

export const shouldDispatchWorkflowTriggerFromCore = (
  data: Pick<
    WorkflowTriggerJobData,
    'coreWorkflowVersionId' | 'workspaceWorkflowVersionId'
  >,
): data is Pick<WorkflowTriggerJobData, never> & {
  coreWorkflowVersionId: string;
  workspaceWorkflowVersionId: string;
} =>
  isDefined(data.coreWorkflowVersionId) &&
  isDefined(data.workspaceWorkflowVersionId);
