import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { type WorkflowCreateInboxItemActionInput } from './workflow-create-inbox-item-action-input.type';

export type WorkflowCreateInboxItemActionSettings =
  BaseWorkflowActionSettings & {
    input: WorkflowCreateInboxItemActionInput;
  };
