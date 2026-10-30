import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  EMPTY_USAGE,
  mockAgentRunTurns,
} from 'test/utils/mock-agent-run-turns.util';
import { type RunAgentThread } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AgentRunTurnService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-turn.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';

export type AgentRunExecution = Parameters<
  AgentRunTurnService['startTurn']
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
  const startTurnSpy = mockAgentRunTurns({
    result: {},
    usage: EMPTY_USAGE,
    cacheCreationTokens: 0,
    nativeWebSearchCallCount: 0,
    stopReason: null,
    isPaused: false,
    steps,
    modelId: 'stub-model',
    totalCostInDollars: 0,
    creditsUsedMicro: 0,
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

    const execution = startTurnSpy.mock.calls[0]?.[0];

    if (!isDefined(execution)) {
      throw new Error(
        `Expected the agent to run: ${JSON.stringify(response.body.errors ?? response.body.data)}`,
      );
    }

    return { ...execution, threadId: response.body.data.runAgent.threadId };
  } finally {
    jest.restoreAllMocks();
  }
};
