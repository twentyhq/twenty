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

export type WorkflowCodeStepSettings = BaseWorkflowStepSettings & {
  input: {
    serverlessFunctionId: string;
  };
};

export type WorkflowSendEmailStepSettings = BaseWorkflowStepSettings & {
  input: {
    connectedAccountId: string;
    email: string;
    subject?: string;
    body?: string;
  };
};
