import { WorkflowFormFieldType } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-field-type.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type FormFieldMetadata = {
  id: string;
  name: string;
  label: string;
  type: WorkflowFormFieldType;
  value?: any;
  placeholder?: string;
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetadata[];
};
