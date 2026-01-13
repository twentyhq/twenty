import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { type WorkflowN8nActionInput } from './workflow-n8n-action-input.type';

export type WorkflowN8nActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowN8nActionInput;
};
