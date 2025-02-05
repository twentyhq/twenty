export type WorkflowCodeActionInput = {
  serverlessFunctionId: string;
  serverlessFunctionVersion: string;
  serverlessFunctionInput: {
    [key: string]: any;
  };
};
