export type WorkflowCodeActionInput = {
  code?: string;
  // Deprecated: steps created before inline code
  logicFunctionId?: string;
  logicFunctionInput: {
    // oxlint-disable-next-line typescript/no-explicit-any
    [key: string]: any;
  };
};
