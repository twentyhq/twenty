import { agentRunInsightsQueryFactory } from 'test/integration/ai/utils/agent-run-insights-query-factory.util';
import { agentRunSummariesQueryFactory } from 'test/integration/ai/utils/agent-run-summaries-query-factory.util';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const insertTurn = ({
  agentId,
  status,
  daysAgo,
}: {
  agentId: string;
  status: AgentTurnStatus;
  daysAgo: number;
}) =>
  global.testDataSource.query(
    `INSERT INTO ${schema}."agentTurn"
       ("agentId", "status", "createdAt", "startedAt", "endedAt", "inputTokens", "outputTokens", "inputCredits", "outputCredits")
     VALUES ($1, $2, NOW() - MAKE_INTERVAL(days => $3), NOW() - MAKE_INTERVAL(days => $3),
       NOW() - MAKE_INTERVAL(days => $3) + INTERVAL '2 seconds', 100, 20, 0, 0)`,
    [agentId, status, daysAgo],
  );

describe('agent run statistics', () => {
  let agentId: string;

  beforeAll(async () => {
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Statistics agent',
        prompt: 'Summarize the deal',
        modelId: TEST_AI_MODEL_ID,
      },
    });

    agentId = data.createOneAgent.id;

    await insertTurn({
      agentId,
      status: AgentTurnStatus.COMPLETED,
      daysAgo: 0,
    });
    await insertTurn({ agentId, status: AgentTurnStatus.FAILED, daysAgo: 1 });
    await insertTurn({
      agentId,
      status: AgentTurnStatus.COMPLETED,
      daysAgo: 30,
    });
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${schema}."agentTurn" WHERE "agentId" = $1`,
      [agentId],
    );
    await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
  });

  it('counts an agent runs over the last 14 days and lists the most recent first', async () => {
    const response = await makeMetadataApiRequest(
      agentRunSummariesQueryFactory(),
    );

    expect(response.body.errors).toBeUndefined();

    const summary = response.body.data.agentRunSummaries.find(
      (runSummary: { agentId: string }) => runSummary.agentId === agentId,
    );

    expect(summary.runCountLast14Days).toBe(2);
    expect(
      summary.recentRuns.map(({ status }: { status: string }) => status),
    ).toEqual(['COMPLETED', 'FAILED', 'COMPLETED']);
  });

  it('aggregates runs, tokens and duration per calendar day', async () => {
    const response = await makeMetadataApiRequest(
      agentRunInsightsQueryFactory({ agentId, timeZone: 'UTC' }),
    );

    expect(response.body.errors).toBeUndefined();

    const insights = response.body.data.agentRunInsights;

    expect(insights).toMatchObject({
      runCount: 2,
      tokenCount: 240,
      credits: 0,
      averageDurationInMs: 2000,
    });
    expect(insights.dailyRunCounts).toHaveLength(14);
    expect(insights.dailyRunCounts.at(-1)).toEqual({
      completedRunCount: 1,
      failedRunCount: 0,
      otherRunCount: 0,
    });
    expect(insights.dailyRunCounts.at(-2)).toEqual({
      completedRunCount: 0,
      failedRunCount: 1,
      otherRunCount: 0,
    });
  });

  it('refuses a member without AI settings access', async () => {
    const response = await makeMetadataApiRequest(
      agentRunInsightsQueryFactory({ agentId, timeZone: 'UTC' }),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });
});
