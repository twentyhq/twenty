import { type PausingToolCallContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-call-context.type';

export type SeededToolCall = {
  toolName: string;
  input: Record<string, unknown>;
  context?: PausingToolCallContext;
};
