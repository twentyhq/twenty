// One shape serves both provider option keys: `anthropic.thinking` and
// `bedrock.reasoningConfig` accept exactly these two variants for Claude.
export type ClaudeReasoningConfig =
  | { type: 'adaptive' }
  | { type: 'enabled'; budgetTokens: number };
