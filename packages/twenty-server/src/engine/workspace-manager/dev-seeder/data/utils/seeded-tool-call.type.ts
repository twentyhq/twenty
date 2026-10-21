export type SeededToolCall = {
  toolName: string;
  input: Record<string, unknown>;
  buildPendingOutput: () => Promise<Record<string, unknown>>;
};
