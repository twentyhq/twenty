import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { WorkflowHttpRequestActionInput } from './workflow-http-request-action-input.type';

export type WorkflowHttpRequestActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowHttpRequestActionInput;
};
