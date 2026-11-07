import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type WorkflowRunInfo = {
  workflowRunId: string;
  workspaceId: string;
};

export type WorkflowActionInput = {
  currentStepId: string;
  trigger: WorkflowTrigger;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
  runInfo: WorkflowRunInfo;
};
