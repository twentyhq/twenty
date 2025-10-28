import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowIteratorActionInput = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: Array<any> | string;
  initialLoopStepIds?: string[];
};

export type WorkflowIteratorActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowIteratorActionInput;
};
