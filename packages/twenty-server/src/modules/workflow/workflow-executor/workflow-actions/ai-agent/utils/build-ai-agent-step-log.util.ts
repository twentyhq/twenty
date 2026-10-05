import {
  type AiAgentStepLogDetails,
  type WorkflowRunStepLog,
} from 'twenty-shared/workflow';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { mapAiStepsToToolCallLogs } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/map-ai-steps-to-tool-call-logs.util';

export const buildAiAgentStepLog = ({
  executionResult,
  durationMs,
}: {
  executionResult: AgentExecutionResult;
  durationMs: number;
}): WorkflowRunStepLog => {
  const details: AiAgentStepLogDetails = {
    type: 'AI_AGENT',
    modelId: executionResult.modelId,
    usage: {
      inputTokens: executionResult.usage.inputTokens ?? 0,
      outputTokens: executionResult.usage.outputTokens ?? 0,
      reasoningTokens:
        executionResult.usage.outputTokenDetails?.reasoningTokens,
      cacheReadTokens: executionResult.usage.inputTokenDetails?.cacheReadTokens,
      cacheCreationTokens: executionResult.cacheCreationTokens,
      totalTokens: executionResult.usage.totalTokens ?? 0,
    },
    cost: {
      totalCostInDollars: executionResult.totalCostInDollars,
      creditsUsedMicro: executionResult.creditsUsedMicro,
    },
    nativeWebSearchCallCount: executionResult.nativeWebSearchCallCount,
    toolCalls: mapAiStepsToToolCallLogs(executionResult.steps),
    durationMs,
  };

  return {
    details,
    entries: [],
    sizeBytes: 0,
  };
};
