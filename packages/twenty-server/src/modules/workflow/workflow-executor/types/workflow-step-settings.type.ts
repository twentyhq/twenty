type BaseWorkflowStepSettings = {
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
