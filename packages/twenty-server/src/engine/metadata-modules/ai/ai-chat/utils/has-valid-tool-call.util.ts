import { type StopCondition, type ToolSet } from 'ai';

export const hasValidToolCall =
  <TOOLS extends ToolSet>(...toolNames: string[]): StopCondition<TOOLS> =>
  ({ steps }) =>
    steps[steps.length - 1]?.toolCalls.some(
      (toolCall) => toolNames.includes(toolCall.toolName) && !toolCall.invalid,
    ) ?? false;
