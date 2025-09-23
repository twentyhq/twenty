export type ToolCallEvent = {
  type: 'tool-call';
  toolCallId: string;
  toolName: string;
  input: {
    loadingMessage: string;
    input: unknown;
  };
};
