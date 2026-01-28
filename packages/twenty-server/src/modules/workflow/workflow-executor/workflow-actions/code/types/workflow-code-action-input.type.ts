export type WorkflowCodeActionInput = {
  logicFunctionId: string;
  logicFunctionVersion: string;
  logicFunctionInput: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
};
