import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

// An agent that asked a question runs again once it is answered, and the
// step's log has to account for every segment rather than the last one only.
export const mergeAiAgentStepLogs = ({
  previousStepLog,
  nextStepLog,
}: {
  previousStepLog: WorkflowRunStepLog | null;
  nextStepLog: WorkflowRunStepLog;
}): WorkflowRunStepLog => {
  const previousDetails = previousStepLog?.details;
  const nextDetails = nextStepLog.details;

  if (previousDetails?.type !== 'AI_AGENT' || nextDetails.type !== 'AI_AGENT') {
    return nextStepLog;
  }

  const sumOptional = (
    previousValue: number | undefined,
    nextValue: number | undefined,
  ) =>
    !isDefined(previousValue) && !isDefined(nextValue)
      ? undefined
      : (previousValue ?? 0) + (nextValue ?? 0);

  return {
    ...nextStepLog,
    details: {
      ...nextDetails,
      usage: {
        inputTokens:
          previousDetails.usage.inputTokens + nextDetails.usage.inputTokens,
        outputTokens:
          previousDetails.usage.outputTokens + nextDetails.usage.outputTokens,
        reasoningTokens: sumOptional(
          previousDetails.usage.reasoningTokens,
          nextDetails.usage.reasoningTokens,
        ),
        cacheReadTokens: sumOptional(
          previousDetails.usage.cacheReadTokens,
          nextDetails.usage.cacheReadTokens,
        ),
        cacheCreationTokens: sumOptional(
          previousDetails.usage.cacheCreationTokens,
          nextDetails.usage.cacheCreationTokens,
        ),
        totalTokens:
          previousDetails.usage.totalTokens + nextDetails.usage.totalTokens,
      },
      cost: {
        totalCostInDollars:
          previousDetails.cost.totalCostInDollars +
          nextDetails.cost.totalCostInDollars,
        creditsUsedMicro:
          previousDetails.cost.creditsUsedMicro +
          nextDetails.cost.creditsUsedMicro,
      },
      nativeWebSearchCallCount:
        previousDetails.nativeWebSearchCallCount +
        nextDetails.nativeWebSearchCallCount,
      toolCalls: [...previousDetails.toolCalls, ...nextDetails.toolCalls],
      durationMs: previousDetails.durationMs + nextDetails.durationMs,
    },
  };
};
