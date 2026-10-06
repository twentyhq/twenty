import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
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
  it('logs the run summary as the AI_AGENT step details', () => {
    expect(buildAiAgentStepLog(SUMMARY)).toEqual({
      details: { type: 'AI_AGENT', ...SUMMARY },
      entries: [],
      sizeBytes: 0,
    });
  });
});
