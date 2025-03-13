import { FieldMetadataType } from 'twenty-shared';

import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

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
