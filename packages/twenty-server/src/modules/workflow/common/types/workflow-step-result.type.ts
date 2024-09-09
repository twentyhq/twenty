type WorkflowError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type WorkflowStepResult = {
  data: object | null;
  error?: WorkflowError;
};
