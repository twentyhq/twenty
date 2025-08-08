import { type WorkflowFormFieldType } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-field-type.type';
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type FormFieldMetadata = {
  id: string;
  name: string;
  label: string;
  type: WorkflowFormFieldType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetadata[];
};
