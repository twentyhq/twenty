import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { WorkflowAiAgentActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-settings.type';
import { WorkflowCodeActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-settings.type';
import { WorkflowFilterActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/types/workflow-filter-action-settings.type';
import { WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { WorkflowHttpRequestActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-settings.type';
import { WorkflowSendEmailActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/types/workflow-send-email-action-settings.type';
import {
  WorkflowCreateRecordActionSettings,
  WorkflowDeleteRecordActionSettings,
  WorkflowFindRecordsActionSettings,
  WorkflowUpdateRecordActionSettings,
} from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/types/workflow-record-crud-action-settings.type';

export type BaseWorkflowActionSettings = {
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
  | WorkflowFindRecordsActionSettings
  | WorkflowFormActionSettings
  | WorkflowFilterActionSettings
  | WorkflowHttpRequestActionSettings
  | WorkflowAiAgentActionSettings;
