import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { buildAiAgentStepLog } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-ai-agent-step-log.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-ai-steps-to-tool-call-logs.util',
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
  modelId: 'claude-sonnet-4',
  totalCostInDollars: 0.012,
  creditsUsedMicro: 12_000,
  steps: [] as AgentExecutionResult['steps'],
};

describe('buildAiAgentStepLog', () => {
  it('returns null when the execution never resolved a model', () => {
    const stepLog = buildAiAgentStepLog({
      executionResult: { ...baseExecutionResult, modelId: undefined },
      durationMs: 1234,
    });

    expect(stepLog).toBeNull();
  });

  it('builds an AI_AGENT step log with usage, cost, and tool calls', () => {
    const stepLog = buildAiAgentStepLog({
      executionResult: baseExecutionResult,
      durationMs: 1234,
    });

    if (stepLog === null || stepLog.details.type !== 'AI_AGENT') {
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
      totalTokens: 155,
    });
    expect(stepLog.details.cost).toEqual({
      totalCostInDollars: 0.012,
      creditsUsedMicro: 12_000,
    });
    expect(stepLog.details.nativeWebSearchCallCount).toBe(2);
    expect(stepLog.details.toolCalls).toHaveLength(1);
    expect(stepLog.entries).toEqual([]);
  });

  it('falls back to zero usage / cost when the agent did not report them', () => {
    const stepLog = buildAiAgentStepLog({
      executionResult: {
        ...baseExecutionResult,
        usage: {} as AgentExecutionResult['usage'],
        cacheCreationTokens: 0,
        totalCostInDollars: undefined,
        creditsUsedMicro: undefined,
        steps: undefined,
      },
      durationMs: 100,
    });

    if (stepLog === null || stepLog.details.type !== 'AI_AGENT') {
      throw new Error('Expected AI_AGENT details');
    }

    expect(stepLog.details.usage.inputTokens).toBe(0);
    expect(stepLog.details.usage.outputTokens).toBe(0);
    expect(stepLog.details.usage.totalTokens).toBe(0);
    expect(stepLog.details.cost.totalCostInDollars).toBe(0);
    expect(stepLog.details.cost.creditsUsedMicro).toBe(0);
    expect(stepLog.details.toolCalls).toEqual([]);
  });
});
