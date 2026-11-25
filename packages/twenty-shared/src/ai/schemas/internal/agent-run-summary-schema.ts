import { z } from 'zod';

const agentRunToolCallLogSchema = z.object({
  toolName: z.string(),
  toolCallId: z.string(),
  providerExecuted: z.boolean().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  errorMessage: z.string().optional(),
  state: z.enum(['started', 'success', 'error', 'awaiting-approval']),
});

export const agentRunSummarySchema = z.object({
  modelId: z.string(),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    reasoningTokens: z.number().optional(),
    cacheReadTokens: z.number().optional(),
    cacheCreationTokens: z.number().optional(),
    totalTokens: z.number(),
  }),
  cost: z.object({
    totalCostInDollars: z.number(),
    creditsUsedMicro: z.number(),
  }),
  nativeWebSearchCallCount: z.number(),
  toolCalls: z.array(agentRunToolCallLogSchema),
  durationMs: z.number(),
});
