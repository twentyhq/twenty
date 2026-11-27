export type LogicFunctionJobFailure<TPayload = object> = {
  payload: TPayload;
  error: {
    type: string;
    message: string;
  };
  job: {
    id: string;
    attemptsMade: number;
  };
};
