import { type AiClassificationInput } from 'twenty-shared/ai';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowClassifyActionSettings = BaseWorkflowActionSettings & {
  input: AiClassificationInput;
};
