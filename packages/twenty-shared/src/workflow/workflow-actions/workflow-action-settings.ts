import {
    WorkflowCreateRecordActionSettings,
    WorkflowDeleteRecordActionSettings,
    WorkflowFindRecordsActionSettings,
    WorkflowUpdateRecordActionSettings,
} from '@/workflow/workflow-actions/record-crud';
import { OutputSchema } from '../workflow-builder/output-schema';
import { WorkflowCodeActionSettings } from './code/workflow-code-action-settings';
import { WorkflowSendEmailActionSettings } from './mail-sender/workflow-send-email-action-settings';

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
