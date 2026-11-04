import { captureAgentRunExecution } from 'test/integration/graphql/suites/user-session/utils/capture-agent-run-execution.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { findFrontComponents } from 'test/integration/metadata/suites/front-component/utils/find-front-components.util';
import { findManyLogicFunctions } from 'test/integration/metadata/suites/logic-function/utils/find-many-logic-functions.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { ToolCategory } from 'twenty-shared/ai';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type ListEndpointTestContext = {
  listApplicationIds: (token: string) => Promise<(string | undefined)[]>;
};

const listEndpointTestCases: EachTestingContext<ListEndpointTestContext>[] = [
  {
    title: 'findManyLogicFunctions',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findManyLogicFunctions({
          token,
          expectToFail: false,
        });

        return data.findManyLogicFunctions.map(
          ({ applicationId }) => applicationId,
        );
      },
    },
  },
  {
    title: 'frontComponents',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findFrontComponents({
          token,
          expectToFail: false,
        });

        return data.frontComponents.map(({ applicationId }) => applicationId);
      },
    },
  },
  {
    title: 'findManyAgents',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findAgents({
          input: undefined,
          token,
          expectToFail: false,
        });

        return data.findManyAgents.map(({ applicationId }) => applicationId);
      },
    },
  },
  {
    title: 'skills',
    context: {
      listApplicationIds: async (token) => {
        const { data } = await findSkills({
          input: undefined,
          token,
          expectToFail: false,
        });

        return data.skills.map(({ applicationId }) => applicationId);
      },
    },
  },
];

describe('The workspace custom application reads and triggers every application', () => {
  let agentApplication: ApplicationWithResources;
  let otherApplication: ApplicationWithResources;
  let agentUniversalIdentifier: string;
  let customApplicationToken: string;
  let agentApplicationToken: string;
  let otherApplicationToken: string;
  const threadIds: string[] = [];

  beforeAll(async () => {
    [agentApplication, otherApplication] = await Promise.all([
      setupApplicationWithResources({ name: 'Composer Reach Agent Owner' }),
      setupApplicationWithResources({ name: 'Composer Reach Other' }),
    ]);

    const [{ universalIdentifier }] = await globalThis.testDataSource.query(
      `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
      [agentApplication.agentId],
    );

    agentUniversalIdentifier = universalIdentifier;

    const [customTokenPair, agentApplicationTokenPair, otherTokenPair] =
      await Promise.all([
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: await findWorkspaceCustomApplicationId(),
        }),
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: agentApplication.id,
        }),
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: otherApplication.id,
        }),
      ]);

    customApplicationToken = customTokenPair.applicationAccessToken.token;
    agentApplicationToken =
      agentApplicationTokenPair.applicationAccessToken.token;
    otherApplicationToken = otherTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    // the applications' own threads have no member who could destroy them through the API
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."recordShare" WHERE "recordId" = ANY($1)`,
      [threadIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."agentChatThread" WHERE id = ANY($1)`,
      [threadIds],
    );

    await Promise.all(
      [agentApplication, otherApplication].map((application) =>
        cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        }),
      ),
    );
  });

  it.each(eachTestingContextFilter(listEndpointTestCases))(
    'should list the items of installed applications from $title',
    async ({ context }) => {
      const applicationIds = await context.listApplicationIds(
        customApplicationToken,
      );

      expect(applicationIds).toEqual(
        expect.arrayContaining([agentApplication.id, otherApplication.id]),
      );
    },
  );

  it('should offer the workflow tools and the function tools of installed applications over MCP', async () => {
    const catalog = await getMcpToolCatalog({ token: customApplicationToken });

    expect(catalog[ToolCategory.WORKFLOW]?.length).toBeGreaterThan(0);
    expect(
      catalog[ToolCategory.LOGIC_FUNCTION]?.map(({ name }) => name),
    ).toEqual(
      expect.arrayContaining([
        'app_composer_reach_agent_owner_handler',
        'app_composer_reach_other_handler',
      ]),
    );
  });

  it('should run the agent of an installed application in a conversation of its own', async () => {
    const thread = { key: 'composer-reach' };

    const composerExecution = await captureAgentRunExecution({
      agentUniversalIdentifier,
      token: customApplicationToken,
      thread,
    });
    const ownerExecution = await captureAgentRunExecution({
      agentUniversalIdentifier,
      token: agentApplicationToken,
      thread,
    });

    threadIds.push(composerExecution.threadId, ownerExecution.threadId);

    expect(composerExecution.threadId).not.toEqual(ownerExecution.threadId);
  });

  it('should keep an installed application from running the agent of another application', async () => {
    const response = await makeMetadataApiRequest(
      runAgentQueryFactory({ agentUniversalIdentifier, prompt: 'Run' }),
      otherApplicationToken,
    );

    expect(response.body.errors?.[0]?.message).toBe(
      `Agent ${agentUniversalIdentifier} belongs to another application`,
    );
  });
});
