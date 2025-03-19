import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { FieldMetadataType } from 'twenty-shared/types';

export type FormFieldMetadata = {
  label: string;
  name: string;
  type: FieldMetadataType;
  placeholder?: string;
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetadata[];
};
