import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type FormFieldMetdata = {
  label: string;
  type: string;
  placeholder?: string;
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetdata[];
};
