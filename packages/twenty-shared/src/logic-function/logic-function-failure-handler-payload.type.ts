export type LogicFunctionFailureHandlerPayload<TPayload = object> = {
  failedLogicFunctionUniversalIdentifier: string;
  payload: TPayload;
  error: {
    errorType: string;
    errorMessage: string;
  };
};
