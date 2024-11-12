import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import { WorkflowRecordOperationActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/record-operation/types/workflow-record-operation-action-settings.type';

export type OutputSchema = object;

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
  | WorkflowRecordOperationActionSettings;
