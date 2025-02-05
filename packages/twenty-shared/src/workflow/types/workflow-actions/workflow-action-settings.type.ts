import { OutputSchema } from '../workflow-builder/output-schema.type';
import { WorkflowCodeActionSettings } from '../workflow-actions/code/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from '../workflow-actions/mail-sender/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from '../workflow-actions/record-crud/workflow-record-crud-action-settings.type';

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
