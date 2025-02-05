type WorkflowActionError = {
  errorType: string;
  errorMessage: string;
  stackTrace: string;
};

export type WorkflowActionResult = {
  result?: object;
  error?: WorkflowActionError;
};
