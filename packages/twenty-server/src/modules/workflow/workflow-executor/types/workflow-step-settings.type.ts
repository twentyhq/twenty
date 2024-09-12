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
  subject?: string;
  template?: string;
  title?: string;
  callToAction?: {
    value: string;
    href: string;
  };
};
