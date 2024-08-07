type WorkflowBaseSettingsType = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
};

export type WorkflowCodeSettingsType = WorkflowBaseSettingsType & {
  serverlessFunctionId: string;
};
