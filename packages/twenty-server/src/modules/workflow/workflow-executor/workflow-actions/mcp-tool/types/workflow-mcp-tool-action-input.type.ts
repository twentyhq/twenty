export type WorkflowMcpToolActionInput = {
  mcpServerId: string;
  toolName: string;
  toolInput: {
    // oxlint-disable-next-line typescript/no-explicit-any
    [key: string]: any;
  };
};
