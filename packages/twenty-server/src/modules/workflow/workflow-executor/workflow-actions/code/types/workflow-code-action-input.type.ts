export type WorkflowCodeActionInput = {
  serverlessFunctionId: string;
  serverlessFunctionVersion: string;
  serverlessFunctionInput: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
};
