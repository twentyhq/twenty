import { type AgentRunSummary } from 'twenty-shared/ai';

import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';

const SUMMARY: AgentRunSummary = {
  modelId: 'claude-sonnet-4',
  usage: {
    inputTokens: 100,
    outputTokens: 50,
    reasoningTokens: 10,
    cacheReadTokens: 20,
    cacheCreationTokens: 5,
    totalTokens: 150,
  },
  cost: { totalCostInDollars: 0.012, creditsUsedMicro: 12_000 },
  nativeWebSearchCallCount: 2,
  toolCalls: [
    { toolName: 'web_search', toolCallId: 'call-1', state: 'success' },
  ],
  durationMs: 1234,
};

describe('buildAiAgentStepLog', () => {
  it('logs the run summary and its conversation as the AI_AGENT step details', () => {
    expect(
      buildAiAgentStepLog({ summary: SUMMARY, threadId: 'thread-id' }),
    ).toEqual({
      details: { type: 'AI_AGENT', ...SUMMARY, threadId: 'thread-id' },
      entries: [],
      sizeBytes: 0,
    });
  });
});
