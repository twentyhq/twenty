type BaseWorkflowSettings = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeSettings = BaseWorkflowSettings & {
  serverlessFunctionId: string;
};
