import { FieldMetadataType } from 'twenty-shared';

import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type FormFieldMetadata = {
  id: string;
  label: string;
  type: FieldMetadataType;
  placeholder?: string;
  settings?: Record<string, any>;
};

export type WorkflowFormActionSettings = BaseWorkflowActionSettings & {
  input: FormFieldMetadata[];
};
