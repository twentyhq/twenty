import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type RunAgentThread } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ai-steps-to-ui-message-parts.util';

export type AgentRunExecution = Parameters<
  AgentRunTurnService['runTurn']
>[0] & { threadId: string };

export const captureAgentRunExecution = async ({
  agentUniversalIdentifier,
  token,
  thread,
  runAsWorkspaceMemberId,
  steps = [],
}: {
  agentUniversalIdentifier: string;
  token: string;
  thread?: RunAgentThread;
  runAsWorkspaceMemberId?: string;
  steps?: AgentExecutionResult['steps'];
}): Promise<AgentRunExecution> => {
  const runAgentTurnSpy = jest
    .spyOn(
      getAppProviderByClassName<AgentRunTurnService>('AgentRunTurnService'),
      'runTurn',
    )
    .mockResolvedValue({
      result: {},
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputTokenDetails: {
          noCacheTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 0,
        },
        outputTokenDetails: { textTokens: 0, reasoningTokens: 0 },
      },
      cacheCreationTokens: 0,
      nativeWebSearchCallCount: 0,
      hasNoMoreAvailableCredits: false,
      isPaused: false,
      steps,
      replyParts: mapAiStepsToUIMessageParts(steps),
      modelId: 'stub-model',
      totalCostInDollars: 0,
      creditsUsedMicro: 0,
      turnUsage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
        inputCredits: 0,
        outputCredits: 0,
      },
    });

  try {
    const response = await makeMetadataApiRequest(
      runAgentQueryFactory({
        agentUniversalIdentifier,
        prompt: 'Run',
        thread,
        runAsWorkspaceMemberId,
      }),
      token,
    );

    const execution = runAgentTurnSpy.mock.calls[0]?.[0];

    if (!isDefined(execution)) {
      throw new Error(
        `Expected the agent to run: ${JSON.stringify(response.body.errors ?? response.body.data)}`,
      );
    }

    return { ...execution, threadId: response.body.data.runAgent.threadId };
  } finally {
    runAgentTurnSpy.mockRestore();
  }
};
