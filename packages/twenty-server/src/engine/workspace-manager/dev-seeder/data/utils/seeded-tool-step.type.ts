export type SeededToolStep = {
  toolName: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  errorText?: string;
  reasoning?: string;
  providerExecuted?: boolean;
};
