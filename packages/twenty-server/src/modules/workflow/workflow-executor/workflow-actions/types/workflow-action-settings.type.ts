import { OutputSchema } from 'src/modules/workflow/workflow-builder/types/output-schema.type';
import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';

export type BaseWorkflowActionSettings = {
  input: object;
  outputSchema: OutputSchema;
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowActionSettings =
  | WorkflowSendEmailActionSettings
  | WorkflowCodeActionSettings
  | WorkflowCreateRecordActionSettings
  | WorkflowUpdateRecordActionSettings
  | WorkflowDeleteRecordActionSettings
  | WorkflowFindRecordsActionSettings;
