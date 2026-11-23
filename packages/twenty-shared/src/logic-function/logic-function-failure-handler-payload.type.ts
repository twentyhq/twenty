export type LogicFunctionFailureHandlerPayload<TPayload = object> = {
  failedLogicFunctionUniversalIdentifier: string;
  jobId: string;
  attemptsMade: number;
  payload: TPayload;
  error: {
    errorType: string;
    errorMessage: string;
  };
};
