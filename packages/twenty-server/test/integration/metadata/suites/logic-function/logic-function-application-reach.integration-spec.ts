import { randomUUID } from 'node:crypto';

import request from 'supertest';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import {
  coreWorkflowGraphqlRequest,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  findCoreWorkflowVersion,
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { executeLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/execute-logic-function.util';
import { findOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/find-one-logic-function.util';
import { getLogicFunctionSourceCode } from 'test/integration/metadata/suites/logic-function/utils/get-logic-function-source-code.util';
import { updateLogicFunctionSource } from 'test/integration/metadata/suites/logic-function/utils/update-logic-function-source.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 as uuidv4 } from 'uuid';

import { type ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { type LogicFunctionPrebuiltWarmUpService } from 'src/engine/core-modules/logic-function/logic-function-prebuilt-warm-up/logic-function-prebuilt-warm-up.service';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { LogicFunctionExecutionStatus } from 'src/engine/metadata-modules/logic-function/dtos/logic-function-execution-result.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type McpToolPayload = {
  success: boolean;
  error?: string;
  result?: unknown;
};

const callMcpExecuteTool = async ({
  token,
  toolName,
  toolArguments,
}: {
  token: string;
  toolName: string;
  toolArguments: Record<string, unknown>;
}): Promise<McpToolPayload> => {
  const id = `call-${randomUUID()}`;
  const response = await request(`http://localhost:${APP_PORT}`)
    .post('/mcp')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        id,
        params: {
          name: 'execute_tool',
          arguments: { toolName, arguments: toolArguments },
        },
      }),
    )
    .expect(200);

  return JSON.parse(response.body.result.content[0].text) as McpToolPayload;
};

const findWorkspaceCustomApplicationId = async (): Promise<string> => {
  const [workspace] = await globalThis.testDataSource.query(
    'SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1',
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspace.workspaceCustomApplicationId;
};

const isLogicFunctionStored = async (logicFunctionId: string) => {
  const rows = await globalThis.testDataSource.query(
    'SELECT id FROM core."logicFunction" WHERE id = $1 AND "deletedAt" IS NULL',
    [logicFunctionId],
  );

  return rows.length === 1;
};

describe('Logic function operations scoped to the caller application', () => {
  let installedApplication: ApplicationWithResources;
  let otherApplication: ApplicationWithResources;
  let workspaceFunctionId: string;
  let installedApplicationToken: string;
  let workspaceCustomApplicationToken: string;
  let driverExecute: jest.Mock;
  const spies: jest.SpyInstance[] = [];

  beforeAll(async () => {
    installedApplication = await setupApplicationWithResources({
      name: 'Reach Installed Application',
    });
    otherApplication = await setupApplicationWithResources({
      name: 'Reach Other Application',
    });

    const { data } = await createOneLogicFunction({
      input: { name: `workspace-function-${uuidv4()}` },
      expectToFail: false,
    });

    workspaceFunctionId = data.createOneLogicFunction.id;

    const [installedApplicationTokenPair, workspaceCustomApplicationTokenPair] =
      await Promise.all([
        generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId: installedApplication.id,
        }),
        generateAppleAdminApplicationTokenPair({
          applicationId: await findWorkspaceCustomApplicationId(),
        }),
      ]);

    installedApplicationToken =
      installedApplicationTokenPair.applicationAccessToken.token;
    workspaceCustomApplicationToken =
      workspaceCustomApplicationTokenPair.applicationAccessToken.token;

    jest.useRealTimers();
  }, 180000);

  beforeEach(() => {
    driverExecute = jest.fn().mockResolvedValue({
      data: { ran: true },
      duration: 1,
      billedDurationMs: 1,
      logs: '',
      status: LogicFunctionExecutionStatus.SUCCESS,
    });

    // Only the sandbox is faked, so the executor still resolves what the caller can reach
    spies.push(
      jest
        .spyOn(
          getAppProviderByClassName<LogicFunctionDriverFactory>(
            'LogicFunctionDriverFactory',
          ),
          'getCurrentDriver',
        )
        .mockReturnValue({
          execute: driverExecute,
          transpile: jest.fn(),
        } as never),
      jest
        .spyOn(
          getAppProviderByClassName<LogicFunctionPrebuiltWarmUpService>(
            'LogicFunctionPrebuiltWarmUpService',
          ),
          'ensurePrebuiltBundleInstalled',
        )
        .mockResolvedValue(undefined as never),
    );
  });

  afterEach(() => {
    spies.splice(0).forEach((spy) => spy.mockRestore());
  });

  afterAll(async () => {
    await deleteLogicFunction({
      input: { id: workspaceFunctionId },
      expectToFail: false,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: installedApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: otherApplication.universalIdentifier,
    });
  });

  describe('through MCP with an installed application token', () => {
    it.each(['update_logic_function_source', 'get_logic_function_source'])(
      'should not find a workspace function with %s',
      async (toolName) => {
        const payload = await callMcpExecuteTool({
          token: installedApplicationToken,
          toolName,
          toolArguments: {
            logicFunctionId: workspaceFunctionId,
            code: 'export const main = async () => ({});',
          },
        });

        expect(payload.success).toBe(false);
        expect(payload.error).toContain(
          `Logic function with id ${workspaceFunctionId} not found`,
        );
      },
    );

    it('should run the tool of its own function', async () => {
      const payload = await callMcpExecuteTool({
        token: installedApplicationToken,
        toolName: buildLogicFunctionToolName(
          'reach-installed-application-handler',
        ),
        toolArguments: {},
      });

      expect(payload).toMatchObject({ success: true, result: { ran: true } });
      expect(driverExecute).toHaveBeenCalledTimes(1);
    });
  });

  describe('through GraphQL with an installed application token', () => {
    it('should not find a workspace function to update', async () => {
      const { errors } = await updateLogicFunctionSource({
        input: {
          id: workspaceFunctionId,
          update: {
            sourceHandlerCode: 'export const main = async () => ({});',
          },
        },
        token: installedApplicationToken,
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].extensions.code).toBe('NOT_FOUND');
    });
  });

  it("should keep another application's function tools out of an installed application's agent run", async () => {
    let catalogToolNames: string[] = [];

    spies.push(
      jest
        .spyOn(
          getAppProviderByClassName<AgentAsyncExecutorService>(
            'AgentAsyncExecutorService',
          ),
          'executeAgent',
        )
        .mockImplementation(async () => {
          const catalog = await getAppProviderByClassName<ToolRegistryService>(
            'ToolRegistryService',
          ).buildToolIndex(SEED_APPLE_WORKSPACE_ID, {
            rolePermissionConfig: { shouldBypassPermissionChecks: true },
            categories: [ToolCategory.LOGIC_FUNCTION],
          });

          catalogToolNames = catalog.map(({ name }) => name);

          throw new Error('The model is not called in this test');
        }),
    );

    const callerApplication =
      await getAppProviderByClassName<ApplicationLookupService>(
        'ApplicationLookupService',
      ).findById({
        id: installedApplication.id,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

    const [agent] = await globalThis.testDataSource.query(
      'SELECT "universalIdentifier" FROM core.agent WHERE id = $1',
      [installedApplication.agentId],
    );

    await getAppProviderByClassName<AgentRunService>('AgentRunService').run({
      workspace: { id: SEED_APPLE_WORKSPACE_ID } as FlatWorkspace,
      requestUserWorkspaceId: null,
      requestWorkspaceMemberId: null,
      callerApplication: callerApplication as never,
      input: {
        agentUniversalIdentifier: agent.universalIdentifier,
        prompt: 'List your tools',
      },
    });

    expect(catalogToolNames).toContain(
      buildLogicFunctionToolName('reach-installed-application-handler'),
    );
    expect(catalogToolNames).not.toContain(
      buildLogicFunctionToolName('reach-other-application-handler'),
    );
  });

  it("should let a workspace custom application token run another application's function", async () => {
    const { data, errors } = await executeLogicFunction({
      input: {
        id: otherApplication.workflowActionLogicFunctionId,
        payload: {},
      },
      token: workspaceCustomApplicationToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.executeOneLogicFunction.data).toEqual({ ran: true });
  });

  describe('on workflow code steps', () => {
    let coreWorkflowId: string;
    let coreWorkflowVersionId: string;

    beforeAll(async () => {
      ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
        name: 'Code step reach',
      }));

      await updateCoreWorkflowVersionTrigger({
        coreWorkflowVersionId,
        trigger: {
          name: 'Manual Trigger',
          type: 'MANUAL',
          settings: { outputSchema: {} },
          nextStepIds: [],
          position: { x: 0, y: 0 },
        },
      });
    });

    afterAll(async () => {
      await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    });

    it('should refuse an installed application creating a code step', async () => {
      const installedApplicationUserToken = (
        await generateAppleAdminApplicationTokenPair({
          applicationId: installedApplication.id,
        })
      ).applicationAccessToken.token;

      await expect(
        createCoreWorkflowVersionStep({
          coreWorkflowVersionId,
          stepType: 'CODE',
          token: installedApplicationUserToken,
        }),
      ).rejects.toThrow(/FORBIDDEN/);
    });

    it("should delete the step and keep another application's function it names", async () => {
      const codeStep = await createCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        stepType: 'CODE',
      });
      const codeStepFunctionId = codeStep.settings.input
        .logicFunctionId as string;

      await updateCoreWorkflowVersionStep({
        coreWorkflowVersionId,
        step: {
          ...codeStep,
          settings: {
            ...codeStep.settings,
            input: {
              ...codeStep.settings.input,
              logicFunctionId: otherApplication.workflowActionLogicFunctionId,
            },
          },
        },
      });

      await coreWorkflowGraphqlRequest({
        query: `
          mutation DeleteCoreWorkflowVersionStep(
            $input: DeleteCoreWorkflowVersionStepInput!
          ) {
            deleteCoreWorkflowVersionStep(input: $input) {
              stepsDiff
            }
          }
        `,
        variables: { input: { coreWorkflowVersionId, stepId: codeStep.id } },
      });

      const { steps } = await findCoreWorkflowVersion({
        coreWorkflowVersionId,
      });

      expect(steps?.some((step) => step.id === codeStep.id)).toBe(false);
      expect(
        await isLogicFunctionStored(
          otherApplication.workflowActionLogicFunctionId,
        ),
      ).toBe(true);

      if (await isLogicFunctionStored(codeStepFunctionId)) {
        await deleteLogicFunction({
          input: { id: codeStepFunctionId },
          expectToFail: false,
        });
      }
    });
  });

  it('should evaluate the operation policy once for a GraphQL call', async () => {
    const isAllowedSpy = jest.spyOn(
      getAppProviderByClassName<OperationAuthorizationService>(
        'OperationAuthorizationService',
      ),
      'isAllowed',
    );

    spies.push(isAllowedSpy);

    const { errors } = await getLogicFunctionSourceCode({
      input: { id: workspaceFunctionId },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(
      isAllowedSpy.mock.calls.filter(
        ([{ policy }]) => policy.name === 'logicFunction.readSource',
      ),
    ).toHaveLength(1);
  });

  it('should still find a workspace function for a member session', async () => {
    const { data } = await findOneLogicFunction({
      input: { id: workspaceFunctionId },
      expectToFail: false,
    });

    expect(isDefined(data.findOneLogicFunction)).toBe(true);
  });
});
