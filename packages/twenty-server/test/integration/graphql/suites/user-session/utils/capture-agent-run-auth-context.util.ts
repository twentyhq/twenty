import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';

export const captureAgentRunAuthContext = async ({
  agentUniversalIdentifier,
  token,
}: {
  agentUniversalIdentifier: string;
  token: string;
}): Promise<WorkspaceAuthContext> => {
  const executeAgentSpy = jest
    .spyOn(
      getAppProviderByClassName<AgentAsyncExecutorService>(
        'AgentAsyncExecutorService',
      ),
      'executeAgent',
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
      steps: [],
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
      runAgentQueryFactory({ agentUniversalIdentifier, prompt: 'Run' }),
      token,
    );

    const authContext =
      executeAgentSpy.mock.calls[0]?.[0]?.executionContext.authContext;

    if (!isDefined(authContext)) {
      throw new Error(
        `Expected the agent to run: ${JSON.stringify(response.body.errors ?? response.body.data)}`,
      );
    }

    return authContext;
  } finally {
    executeAgentSpy.mockRestore();
  }
};
