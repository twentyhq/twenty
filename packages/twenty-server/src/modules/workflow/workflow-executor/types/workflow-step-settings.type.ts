import { WorkflowCreateRecordStepInput } from 'src/modules/workflow/workflow-executor/workflow-actions/create-record.workflow-action';

export type OutputSchema = object;

type BaseWorkflowStepSettings = {
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

export type WorkflowCodeStepInput = {
  serverlessFunctionId: string;
  serverlessFunctionVersion: string;
  serverlessFunctionInput: {
    [key: string]: any;
  };
};

export type WorkflowCodeStepSettings = BaseWorkflowStepSettings & {
  input: WorkflowCodeStepInput;
};

export type WorkflowSendEmailStepInput = {
  connectedAccountId: string;
  email: string;
  subject?: string;
  body?: string;
};

export type WorkflowSendEmailStepSettings = BaseWorkflowStepSettings & {
  input: WorkflowSendEmailStepInput;
};

export type WorkflowCreateRecordStepSettings = BaseWorkflowStepSettings & {
  input: WorkflowCreateRecordStepInput;
};

export type WorkflowStepSettings =
  | WorkflowSendEmailStepSettings
  | WorkflowCodeStepSettings
  | WorkflowCreateRecordStepSettings;
