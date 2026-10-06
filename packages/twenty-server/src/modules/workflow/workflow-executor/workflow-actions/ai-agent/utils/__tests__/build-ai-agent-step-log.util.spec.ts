import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';

jest.mock(
  'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/map-ai-steps-to-tool-call-logs.util',
  () => ({
    mapAiStepsToToolCallLogs: jest.fn().mockReturnValue([
      {
        toolName: 'web_search',
        toolCallId: 'call-1',
        state: 'success',
      },
    ]),
  }),
);

const baseExecutionResult: AgentExecutionResult = {
  result: { answer: 'hello' },
  usage: {
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    inputTokenDetails: { cacheReadTokens: 20 },
    outputTokenDetails: { reasoningTokens: 10 },
  } as AgentExecutionResult['usage'],
  cacheCreationTokens: 5,
  nativeWebSearchCallCount: 2,
  hasNoMoreAvailableCredits: false,
  isPaused: false,
  modelId: 'claude-sonnet-4',
  totalCostInDollars: 0.012,
  creditsUsedMicro: 12_000,
  turnUsage: {
    inputTokens: 100,
    outputTokens: 50,
    cacheReadTokens: 20,
    cacheCreationTokens: 5,
    inputCredits: 0,
    outputCredits: 0,
  },
  steps: [],
};

describe('buildAiAgentStepLog', () => {
  it('builds an AI_AGENT step log with usage, cost, and tool calls', () => {
    const stepLog = buildAiAgentStepLog({
      executionResult: baseExecutionResult,
      durationMs: 1234,
    });

    if (stepLog.details.type !== 'AI_AGENT') {
      throw new Error('Expected AI_AGENT details');
    }

    expect(stepLog.details.modelId).toBe('claude-sonnet-4');
    expect(stepLog.details.durationMs).toBe(1234);
    expect(stepLog.details.usage).toEqual({
      inputTokens: 100,
      outputTokens: 50,
      reasoningTokens: 10,
      cacheReadTokens: 20,
      cacheCreationTokens: 5,
      totalTokens: 150,
    });
    expect(stepLog.details.cost).toEqual({
      totalCostInDollars: 0.012,
      creditsUsedMicro: 12_000,
    });
    expect(stepLog.details.nativeWebSearchCallCount).toBe(2);
    expect(stepLog.details.toolCalls).toHaveLength(1);
    expect(stepLog.entries).toEqual([]);
  });

  it('falls back to zero tokens when the provider did not report usage', () => {
    const stepLog = buildAiAgentStepLog({
      executionResult: {
        ...baseExecutionResult,
        usage: {} as AgentExecutionResult['usage'],
      },
      durationMs: 100,
    });

    if (stepLog.details.type !== 'AI_AGENT') {
      throw new Error('Expected AI_AGENT details');
    }

    expect(stepLog.details.usage.inputTokens).toBe(0);
    expect(stepLog.details.usage.outputTokens).toBe(0);
    expect(stepLog.details.usage.totalTokens).toBe(0);
  });
});
