import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import {
  type BaseWorkflowActionSettings,
  type WithExpectedOutputSchema,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowCodeActionSettings = BaseWorkflowActionSettings &
  WithExpectedOutputSchema & {
    input: WorkflowCodeActionInput;
  };
