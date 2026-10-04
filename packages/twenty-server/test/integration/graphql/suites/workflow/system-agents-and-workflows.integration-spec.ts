import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { findAgents } from 'test/integration/metadata/suites/agent/utils/find-agents.util';

const CORE_WORKFLOWS_QUERY = `
  query CoreWorkflows($includeSystem: Boolean) {
    coreWorkflows(first: 200, includeSystem: $includeSystem) {
      edges {
        node {
          id
          isSystem
        }
      }
      totalCount
    }
  }
`;

const CORE_WORKFLOW_VERSIONS_QUERY = `
  query CoreWorkflowVersionsByCoreWorkflowId($coreWorkflowId: UUID!) {
    coreWorkflowVersionsByCoreWorkflowId(coreWorkflowId: $coreWorkflowId) {
      id
    }
  }
`;

const CORE_WORKFLOW_VERSION_BY_ID_QUERY = `
  query CoreWorkflowVersionById($coreWorkflowVersionId: UUID!) {
    coreWorkflowVersionById(coreWorkflowVersionId: $coreWorkflowVersionId) {
      steps
    }
  }
`;

const listCoreWorkflows = async (includeSystem?: boolean) => {
  const response = await workflowGraphqlRequest(CORE_WORKFLOWS_QUERY, {
    includeSystem,
  });

  expect(response.body.errors).toBeUndefined();

  const { edges, totalCount } = response.body.data.coreWorkflows as {
    edges: { node: { id: string; isSystem: boolean } }[];
    totalCount: number;
  };

  return { workflows: edges.map((edge) => edge.node), totalCount };
};

describe('system agents and workflows (e2e)', () => {
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let userAgentId: string;

  beforeAll(async () => {
    const createResponse = await workflowGraphqlRequest(`
      mutation {
        createCoreWorkflow(input: { name: "System Agents And Workflows" }) {
          id
          isSystem
        }
      }
    `);

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createCoreWorkflow.isSystem).toBe(false);

    coreWorkflowId = createResponse.body.data.createCoreWorkflow.id;

    const versionsResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSIONS_QUERY,
      { coreWorkflowId },
    );

    expect(versionsResponse.body.errors).toBeUndefined();

    coreWorkflowVersionId =
      versionsResponse.body.data.coreWorkflowVersionsByCoreWorkflowId[0].id;

    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'System Flag User Agent',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
      },
    });

    userAgentId = data.createOneAgent.id;
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `UPDATE core."workflow" SET "isSystem" = false WHERE id = $1`,
      [coreWorkflowId],
    );

    await workflowGraphqlRequest(
      `
        mutation DeleteCoreWorkflows($input: DeleteCoreWorkflowsInput!) {
          deleteCoreWorkflows(input: $input) {
            id
          }
        }
      `,
      { input: { coreWorkflowIds: [coreWorkflowId] } },
    );

    await deleteOneAgent({ expectToFail: false, input: { id: userAgentId } });
  });

  it('flags the agent created by an AI agent step as system, not the ones members create', async () => {
    const createStepResponse = await workflowGraphqlRequest(
      `
        mutation CreateCoreWorkflowVersionStep(
          $input: CreateCoreWorkflowVersionStepInput!
        ) {
          createCoreWorkflowVersionStep(input: $input) {
            stepsDiff
          }
        }
      `,
      {
        input: {
          coreWorkflowVersionId,
          stepType: 'AI_AGENT',
          position: { x: 200, y: 0 },
        },
      },
    );

    expect(createStepResponse.body.errors).toBeUndefined();

    const versionResponse = await workflowGraphqlRequest(
      CORE_WORKFLOW_VERSION_BY_ID_QUERY,
      { coreWorkflowVersionId },
    );

    expect(versionResponse.body.errors).toBeUndefined();

    const workflowAgentId =
      versionResponse.body.data.coreWorkflowVersionById.steps[0].settings.input
        .agentId;

    const { data } = await findAgents({
      expectToFail: false,
      gqlFields: 'id isSystem',
    });

    const isSystemByAgentId = new Map(
      data.findManyAgents.map((agent) => [agent.id, agent.isSystem]),
    );

    expect(isSystemByAgentId.get(workflowAgentId)).toBe(true);
    expect(isSystemByAgentId.get(userAgentId)).toBe(false);
  });

  it('leaves system workflows out of the list unless they are asked for', async () => {
    await global.testDataSource.query(
      `UPDATE core."workflow" SET "isSystem" = true WHERE id = $1`,
      [coreWorkflowId],
    );

    const withoutSystem = await listCoreWorkflows();
    const withSystem = await listCoreWorkflows(true);

    expect(
      withoutSystem.workflows.some(({ id }) => id === coreWorkflowId),
    ).toBe(false);
    expect(withoutSystem.totalCount).toBe(withoutSystem.workflows.length);

    expect(
      withSystem.workflows.find(({ id }) => id === coreWorkflowId)?.isSystem,
    ).toBe(true);
    expect(withSystem.totalCount).toBe(withSystem.workflows.length);
  });
});
