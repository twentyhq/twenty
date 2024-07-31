export type WorkflowCodeSettingsType = {
  serverlessFunctionId: string;
};

export type WorkflowSettingsType = {
  errorHandlingOptions: {
    retryOnFailure: {
      value: boolean;
    };
    continueOnFailure: {
      value: boolean;
    };
  };
} & WorkflowCodeSettingsType;
