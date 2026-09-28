import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { mergeAiAgentStepLogs } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/merge-ai-agent-step-logs.util';

const buildAgentStepLog = ({
  modelId,
  tokens,
  toolCallNames,
  durationMs,
}: {
  modelId: string;
  tokens: number;
  toolCallNames: string[];
  durationMs: number;
}): WorkflowRunStepLog => ({
  details: {
    type: 'AI_AGENT',
    modelId,
    usage: {
      inputTokens: tokens,
      outputTokens: tokens,
      reasoningTokens: tokens,
      totalTokens: tokens * 2,
    },
    cost: { totalCostInDollars: tokens / 100, creditsUsedMicro: tokens },
    nativeWebSearchCallCount: 1,
    toolCalls: toolCallNames.map((toolName) => ({
      toolName,
      toolCallId: `${toolName}-call`,
      state: 'success',
    })),
    durationMs,
  },
  entries: [],
  sizeBytes: 0,
});

describe('mergeAiAgentStepLogs', () => {
  it('adds the segment after an answer to the one before it', () => {
    const merged = mergeAiAgentStepLogs({
      previousStepLog: buildAgentStepLog({
        modelId: 'model-a',
        tokens: 10,
        toolCallNames: ['search', 'ask_questions'],
        durationMs: 100,
      }),
      nextStepLog: buildAgentStepLog({
        modelId: 'model-b',
        tokens: 5,
        toolCallNames: ['send_email'],
        durationMs: 50,
      }),
    });

    expect(merged.details).toMatchObject({
      modelId: 'model-b',
      usage: {
        inputTokens: 15,
        outputTokens: 15,
        reasoningTokens: 15,
        totalTokens: 30,
      },
      cost: { totalCostInDollars: expect.closeTo(0.15), creditsUsedMicro: 15 },
      nativeWebSearchCallCount: 2,
      durationMs: 150,
    });
    expect(
      merged.details.type === 'AI_AGENT'
        ? merged.details.toolCalls.map(({ toolName }) => toolName)
        : [],
    ).toEqual(['search', 'ask_questions', 'send_email']);
  });

  it('keeps the new log when there is nothing before it', () => {
    const nextStepLog = buildAgentStepLog({
      modelId: 'model-a',
      tokens: 5,
      toolCallNames: [],
      durationMs: 50,
    });

    expect(mergeAiAgentStepLogs({ previousStepLog: null, nextStepLog })).toBe(
      nextStepLog,
    );
  });
});
