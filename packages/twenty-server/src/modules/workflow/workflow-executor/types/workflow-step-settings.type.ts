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
  serverlessFunctionId: string;
};

export type WorkflowSendEmailStepSettings = BaseWorkflowStepSettings & {
  connectedAccountId: string;
  subject?: string;
  body?: string;
};
