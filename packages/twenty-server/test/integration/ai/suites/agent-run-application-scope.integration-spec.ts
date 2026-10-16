import { type LanguageModelV4CallOptions } from '@ai-sdk/provider';
import { MockLanguageModelV4 } from 'ai/test';
import gql from 'graphql-tag';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { runAgentQueryFactory } from 'test/integration/graphql/suites/user-session/utils/run-agent-query-factory.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const USAGE = {
  inputTokens: {
    total: 1,
    noCache: 1,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

const TOOL_CALL_ID = 'reach-attempt';

type AgentRunToolRequest = {
  toolName: string;
  toolArguments: Record<string, unknown>;
};

type CapturedAgentRun = {
  instructions?: string;
  toolOutput?: unknown;
};

// A lazy run lists its tool catalog in the instructions; the model may ask for one tool through execute_tool, then answers
const mockAgentModel = (
  toolRequest?: AgentRunToolRequest,
): CapturedAgentRun => {
  const capturedRun: CapturedAgentRun = {};
  const model = new MockLanguageModelV4({
    doGenerate: async (options: LanguageModelV4CallOptions) => {
      capturedRun.instructions ??= options.prompt
        .flatMap((message) =>
          message.role === 'system' ? [message.content] : [],
        )
        .join('\n');

      const resultPart = options.prompt
        .flatMap((message) => (message.role === 'tool' ? message.content : []))
        .find(
          (part) =>
            part.type === 'tool-result' && part.toolCallId === TOOL_CALL_ID,
        );

      if (isDefined(resultPart) && resultPart.type === 'tool-result') {
        capturedRun.toolOutput = resultPart.output;
      } else if (isDefined(toolRequest)) {
        return {
          content: [
            {
              type: 'tool-call',
              toolCallId: TOOL_CALL_ID,
              toolName: 'execute_tool',
              input: JSON.stringify({
                toolName: toolRequest.toolName,
                arguments: toolRequest.toolArguments,
              }),
            },
          ],
          finishReason: { unified: 'tool-calls', raw: undefined },
          usage: USAGE,
          warnings: [],
        };
      }

      return {
        content: [{ type: 'text', text: 'Done' }],
        finishReason: { unified: 'stop', raw: undefined },
        usage: USAGE,
        warnings: [],
      };
    },
  });

  jest
    .spyOn(
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      ),
      'resolveModelForAgent',
    )
    .mockReturnValue({
      modelId: TEST_AI_MODEL_ID,
      sdkPackage: '@ai-sdk/openai',
      model,
    } as unknown as RegisteredAiModel);

  return capturedRun;
};

const findAgentUniversalIdentifier = async (agentId: string) => {
  const [{ universalIdentifier }] = await globalThis.testDataSource.query(
    `SELECT "universalIdentifier" FROM core."agent" WHERE id = $1`,
    [agentId],
  );

  return universalIdentifier as string;
};

describe('Installed application agent runs should stay off workflows and other applications logic functions', () => {
  let ownerApplication: ApplicationWithResources;
  let installedApplication: ApplicationWithResources;
  let agentRoleId: string;
  let installedAgentUniversalIdentifier: string;
  let workspaceAgentId: string;
  let workspaceAgentUniversalIdentifier: string;
  let workspaceLogicFunctionId: string;
  let ownerToolName: string;
  let ownerApplicationToken: string;

  const runAgent = async (
    agentUniversalIdentifier: string,
    toolRequest?: AgentRunToolRequest,
  ) => {
    const capturedRun = mockAgentModel(toolRequest);

    const response = await makeMetadataApiRequest(
      runAgentQueryFactory({ agentUniversalIdentifier, prompt: 'Run' }),
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    return capturedRun;
  };

  beforeAll(async () => {
    ownerApplication = await setupApplicationWithResources({
      name: 'Logic Function Owner',
    });
    installedApplication = await setupApplicationWithResources({
      name: 'Agent Run Scope Probe',
    });

    const [{ name: ownerLogicFunctionName }] =
      await globalThis.testDataSource.query(
        `SELECT name FROM core."logicFunction" WHERE id = $1`,
        [ownerApplication.logicFunctionId],
      );

    ownerToolName = buildLogicFunctionToolName(ownerLogicFunctionName);

    const { data: roleData } = await createOneRole({
      input: {
        label: 'Agent run scope probe',
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToAgents: true,
      },
      expectToFail: false,
    });

    agentRoleId = roleData.createOneRole.id;

    // The role grants workflows, so only the agent's application can withhold the workflow tools
    await upsertPermissionFlags({
      expectToFail: false,
      input: {
        roleId: agentRoleId,
        permissionFlagKeys: [PermissionFlagType.WORKFLOWS],
      },
    });

    const assignResponse = await makeMetadataApiRequest({
      query: gql`
        mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
          assignRoleToAgent(agentId: $agentId, roleId: $roleId)
        }
      `,
      variables: { agentId: installedApplication.agentId, roleId: agentRoleId },
    });

    expect(assignResponse.body.errors).toBeUndefined();

    installedAgentUniversalIdentifier = await findAgentUniversalIdentifier(
      installedApplication.agentId,
    );

    const { data: agentData } = await createOneAgent({
      input: {
        label: 'Workspace agent run scope probe',
        prompt: 'Run',
        modelId: TEST_AI_MODEL_ID,
        roleId: agentRoleId,
      },
      expectToFail: false,
    });

    workspaceAgentId = agentData.createOneAgent.id;
    workspaceAgentUniversalIdentifier =
      await findAgentUniversalIdentifier(workspaceAgentId);

    const { data: logicFunctionData } = await createOneLogicFunction({
      input: { name: 'Workspace logic function' },
      expectToFail: false,
    });

    workspaceLogicFunctionId = logicFunctionData.createOneLogicFunction.id;

    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: ownerApplication.id,
    });

    ownerApplicationToken = applicationAccessToken.token;
  }, 180000);

  afterAll(async () => {
    if (isDefined(workspaceLogicFunctionId)) {
      await deleteLogicFunction({
        input: { id: workspaceLogicFunctionId },
        expectToFail: false,
      });
    }

    if (isDefined(workspaceAgentId)) {
      await deleteOneAgent({
        input: { id: workspaceAgentId },
        expectToFail: false,
      });
    }

    for (const application of [ownerApplication, installedApplication]) {
      if (isDefined(application)) {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: application.universalIdentifier,
        });
      }
    }

    if (isDefined(agentRoleId)) {
      await deleteOneRole({
        input: { idToDelete: agentRoleId },
        expectToFail: false,
      });
    }
  });

  afterEach(() => jest.restoreAllMocks());

  it('should offer the workflow tools to a workspace agent', async () => {
    const { instructions } = await runAgent(workspaceAgentUniversalIdentifier);

    expect(instructions).toContain('`list_workflows`');
    expect(instructions).toContain('`create_complete_workflow`');
  });

  it('should offer no workflow tool to an installed application agent', async () => {
    const { instructions } = await runAgent(installedAgentUniversalIdentifier);

    expect(instructions).not.toContain('`list_workflows`');
    expect(instructions).not.toContain('`create_complete_workflow`');
  });

  it('should offer a logic function tool to its own application', async () => {
    const catalog = await getMcpToolCatalog({ token: ownerApplicationToken });

    expect(
      (catalog[ToolCategory.LOGIC_FUNCTION] ?? []).map(({ name }) => name),
    ).toContain(ownerToolName);
  });

  it.each([
    {
      title: 'run another application logic function tool',
      request: () => ({ toolName: ownerToolName, toolArguments: {} }),
    },
    {
      title: 'read another application logic function source',
      request: () => ({
        toolName: 'get_logic_function_source',
        toolArguments: { logicFunctionId: ownerApplication.logicFunctionId },
      }),
    },
    {
      title: 'read a workspace logic function source',
      request: () => ({
        toolName: 'get_logic_function_source',
        toolArguments: { logicFunctionId: workspaceLogicFunctionId },
      }),
    },
    {
      title: 'rewrite a workspace logic function source',
      request: () => ({
        toolName: 'update_logic_function_source',
        toolArguments: {
          logicFunctionId: workspaceLogicFunctionId,
          code: 'export const main = async () => ({});',
        },
      }),
    },
    {
      title: 'list the logic functions workflows can run',
      request: () => ({
        toolName: 'list_logic_function_tools',
        toolArguments: {},
      }),
    },
    {
      title: 'create a workflow',
      request: () => ({
        toolName: 'create_complete_workflow',
        toolArguments: {},
      }),
    },
  ])(
    'should refuse an installed application agent to $title',
    async ({ request }) => {
      const { toolName, toolArguments } = request();

      const { toolOutput } = await runAgent(installedAgentUniversalIdentifier, {
        toolName,
        toolArguments,
      });

      expect(toolOutput).toEqual({
        type: 'json',
        value: expect.objectContaining({
          success: false,
          message: `Tool "${toolName}" is not available`,
        }),
      });
    },
  );
});
