import { randomUUID } from 'node:crypto';

import { MockLanguageModelV4 } from 'ai/test';
import { parse } from 'graphql';
import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AI_SDK_OPENAI } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const RUN_SUFFIX = randomUUID();
const APP_ID = randomUUID();
const APPLICATION_ROLE_ID = randomUUID();
const AGENT_ROLE_ID = randomUUID();
const AGENT_ID = randomUUID();

const VISIBLE_MARKER = `Agent visible ${randomUUID()}`;
const VISIBLE_COMPANY_ID = randomUUID();
const HIDDEN_COMPANY_ID = randomUUID();
const VISIBLE_COMPANY_NAME = `${VISIBLE_MARKER} company`;
const HIDDEN_COMPANY_NAME = `Agent hidden ${HIDDEN_COMPANY_ID}`;
const OPPORTUNITY_ID = randomUUID();
const OPPORTUNITY_NAME = `Agent opportunity ${OPPORTUNITY_ID}`;

const COMPANY_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.company.universalIdentifier;
const OPPORTUNITY_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.opportunity.universalIdentifier;

// The application reads companies only; the agent role reads opportunities too but only the marked companies,
// so every assertion fails if either role is dropped from the agent execution
const buildManifest = (): Manifest =>
  buildBaseManifest({
    appId: APP_ID,
    roleId: APPLICATION_ROLE_ID,
    overrides: {
      roles: [
        {
          universalIdentifier: APPLICATION_ROLE_ID,
          label: `Agent execution application role ${RUN_SUFFIX}`,
          description: 'Role of the application that runs the agent',
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          objectPermissions: [
            {
              universalIdentifier: randomUUID(),
              objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
        },
        {
          universalIdentifier: AGENT_ROLE_ID,
          label: `Agent execution agent role ${RUN_SUFFIX}`,
          description: 'Role of the agent, wider than the application',
          canBeAssignedToAgents: true,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          objectPermissions: [
            {
              universalIdentifier: randomUUID(),
              objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
            {
              universalIdentifier: randomUUID(),
              objectUniversalIdentifier: OPPORTUNITY_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          rowLevelPermissionPredicates: [
            {
              universalIdentifier: randomUUID(),
              objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
              fieldUniversalIdentifier:
                STANDARD_OBJECTS.company.fields.name.universalIdentifier,
              operand: RowLevelPermissionPredicateOperand.CONTAINS,
              value: VISIBLE_MARKER,
            },
          ],
        },
      ],
      agents: [
        {
          universalIdentifier: AGENT_ID,
          name: `permission-probe-${RUN_SUFFIX}`,
          label: 'Permission probe',
          prompt: 'You look records up.',
          roleUniversalIdentifier: AGENT_ROLE_ID,
        },
      ],
    },
  });

const RUN_AGENT = parse(`
  mutation RunAgent($input: RunAgentInput!) {
    runAgent(input: $input) {
      result
      error
      success
    }
  }
`);

type ExecuteToolCall = {
  toolName: string;
  arguments: Record<string, unknown>;
};

type DoGenerateResult = Awaited<ReturnType<MockLanguageModelV4['doGenerate']>>;

const USAGE: DoGenerateResult['usage'] = {
  inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 1, text: 1, reasoning: 0 },
};

// Calls one tool, then answers with what the tool returned, so the run result is exactly what the agent could see
const buildToolCallingModel = (executeToolCall: ExecuteToolCall) =>
  new MockLanguageModelV4({
    doGenerate: async ({ prompt }) => {
      const toolMessages = prompt.filter(({ role }) => role === 'tool');

      if (toolMessages.length === 0) {
        return {
          content: [
            {
              type: 'tool-call',
              toolCallId: 'execute-tool-call',
              toolName: 'execute_tool',
              input: JSON.stringify(executeToolCall),
            },
          ],
          finishReason: { unified: 'tool-calls', raw: undefined },
          usage: USAGE,
          warnings: [],
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify(toolMessages) }],
        finishReason: { unified: 'stop', raw: undefined },
        usage: USAGE,
        warnings: [],
      };
    },
  });

const FIND_COMPANIES: ExecuteToolCall = {
  toolName: 'find_many_companies',
  arguments: {
    select: ['id', 'name'],
    id: { in: [VISIBLE_COMPANY_ID, HIDDEN_COMPANY_ID] },
  },
};

const FIND_OPPORTUNITIES: ExecuteToolCall = {
  toolName: 'find_many_opportunities',
  arguments: {
    select: ['id', 'name'],
    id: { in: [OPPORTUNITY_ID] },
  },
};

const createRecord = async (
  objectMetadataSingularName: string,
  data: { id: string; name: string },
) => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const destroyRecord = (objectMetadataSingularName: string, recordId: string) =>
  makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

describe('agent execution permissions', () => {
  let applicationAccessToken: string;
  let workspaceAgentId: string;
  let workspaceAgentUniversalIdentifier: string;
  let workspaceAgentRoleId: string;
  let memberCallerRoleId: string;
  let memberRoleId: string;
  const spies: jest.SpyInstance[] = [];
  let resolveModelForAgent: jest.SpyInstance;

  const runAgent = async ({
    executeToolCall,
    runAsWorkspaceMemberId,
    agentUniversalIdentifier = AGENT_ID,
    token = applicationAccessToken,
  }: {
    executeToolCall: ExecuteToolCall;
    runAsWorkspaceMemberId?: string;
    agentUniversalIdentifier?: string;
    token?: string;
  }): Promise<string> => {
    resolveModelForAgent.mockReturnValue({
      modelId: 'test-model',
      sdkPackage: AI_SDK_OPENAI,
      model: buildToolCallingModel(executeToolCall),
    } as RegisteredAiModel);

    const response = await makeMetadataApiRequest(
      {
        query: RUN_AGENT,
        variables: {
          input: {
            agentUniversalIdentifier,
            prompt: 'Look the records up',
            runAsWorkspaceMemberId,
          },
        },
      },
      token,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.runAgent.success).toBe(true);

    return response.body.data.runAgent.result.response;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'Agent execution permissions',
      description: 'Application whose agent is bounded by its role',
      sourcePath: 'agent-execution-permissions',
    });

    // setupApplicationForSync leaves fake timers installed
    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const [{ id: applicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [APP_ID, SEED_APPLE_WORKSPACE_ID],
    );

    const tokenPair = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId,
    });

    applicationAccessToken = tokenPair.applicationAccessToken.token;

    // An agent of the workspace application, which has no default role, run by a member narrower than the agent
    const [{ id: opportunityObjectMetadataId }] =
      await globalThis.testDataSource.query(
        `SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'opportunity' AND "workspaceId" = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    const memberCallerRole = await createOneRole({
      input: {
        label: `Agent caller role ${RUN_SUFFIX}`,
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canBeAssignedToUsers: true,
      },
      expectToFail: false,
    });

    memberCallerRoleId = memberCallerRole.data.createOneRole.id;

    await upsertObjectPermissions({
      input: {
        roleId: memberCallerRoleId,
        objectPermissions: [
          {
            objectMetadataId: opportunityObjectMetadataId,
            canReadObjectRecords: false,
          },
        ],
      },
      expectToFail: false,
    });

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await updateWorkspaceMemberRole({
      input: {
        roleId: memberCallerRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });

    const workspaceAgentRole = await createOneRole({
      input: {
        label: `Workspace agent role ${RUN_SUFFIX}`,
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
      },
      expectToFail: false,
    });

    workspaceAgentRoleId = workspaceAgentRole.data.createOneRole.id;

    const workspaceAgent = await createOneAgent({
      input: {
        label: `Workspace permission probe ${RUN_SUFFIX}`,
        prompt: 'You look records up.',
        modelId: TEST_AI_MODEL_ID,
        roleId: workspaceAgentRoleId,
      },
      expectToFail: false,
    });

    workspaceAgentId = workspaceAgent.data.createOneAgent.id;

    const [{ universalIdentifier }] = await globalThis.testDataSource.query(
      `SELECT "universalIdentifier" FROM core.agent WHERE id = $1`,
      [workspaceAgentId],
    );

    workspaceAgentUniversalIdentifier = universalIdentifier;

    await createRecord('company', {
      id: VISIBLE_COMPANY_ID,
      name: VISIBLE_COMPANY_NAME,
    });
    await createRecord('company', {
      id: HIDDEN_COMPANY_ID,
      name: HIDDEN_COMPANY_NAME,
    });
    await createRecord('opportunity', {
      id: OPPORTUNITY_ID,
      name: OPPORTUNITY_NAME,
    });

    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );
    const aiBillingService =
      getAppProviderByClassName<AiBillingService>('AiBillingService');

    resolveModelForAgent = jest.spyOn(
      aiModelRegistryService,
      'resolveModelForAgent',
    );

    spies.push(
      resolveModelForAgent,
      jest
        .spyOn(aiModelRegistryService, 'validateModelAvailability')
        .mockReturnValue(undefined),
      jest
        .spyOn(aiBillingService, 'assertAiExecutionAllowed')
        .mockResolvedValue(undefined),
      jest
        .spyOn(aiBillingService, 'decrementAndCheckAvailableCredits')
        .mockResolvedValue({ hasNoMoreAvailableCredits: false }),
      jest.spyOn(aiBillingService, 'calculateStepsCost').mockReturnValue(0),
      jest
        .spyOn(aiBillingService, 'emitAiTokenUsageEvent')
        .mockResolvedValue(undefined),
      jest
        .spyOn(aiBillingService, 'billNativeWebSearchUsage')
        .mockResolvedValue(undefined),
    );
  }, 120000);

  afterAll(async () => {
    spies.forEach((spy) => spy.mockRestore());

    await destroyRecord('company', VISIBLE_COMPANY_ID);
    await destroyRecord('company', HIDDEN_COMPANY_ID);
    await destroyRecord('opportunity', OPPORTUNITY_ID);

    await updateWorkspaceMemberRole({
      input: {
        roleId: memberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    await deleteOneAgent({ input: { id: workspaceAgentId } });
    await deleteOneRole({ input: { idToDelete: workspaceAgentRoleId } });
    await deleteOneRole({ input: { idToDelete: memberCallerRoleId } });

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  }, 120000);

  it('does not let the agent read an object its application cannot read', async () => {
    const toolOutput = await runAgent({ executeToolCall: FIND_OPPORTUNITIES });

    expect(toolOutput).toContain('is not available');
    expect(toolOutput).not.toContain(OPPORTUNITY_NAME);
  }, 60000);

  it('applies the agent role row-level predicates', async () => {
    const toolOutput = await runAgent({ executeToolCall: FIND_COMPANIES });

    expect(toolOutput).toContain(VISIBLE_COMPANY_NAME);
    expect(toolOutput).not.toContain(HIDDEN_COMPANY_NAME);
  }, 60000);

  it('caps a run-as an admin by the role of the calling application', async () => {
    const toolOutput = await runAgent({
      executeToolCall: FIND_OPPORTUNITIES,
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    expect(toolOutput).toContain('is not available');
    expect(toolOutput).not.toContain(OPPORTUNITY_NAME);
  }, 60000);

  it('keeps the agent role row-level predicates on a run-as an admin', async () => {
    const toolOutput = await runAgent({
      executeToolCall: FIND_COMPANIES,
      runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    expect(toolOutput).toContain(VISIBLE_COMPANY_NAME);
    expect(toolOutput).not.toContain(HIDDEN_COMPANY_NAME);
  }, 60000);

  it('runs a workspace agent for a signed-in member', async () => {
    const toolOutput = await runAgent({
      executeToolCall: FIND_COMPANIES,
      agentUniversalIdentifier: workspaceAgentUniversalIdentifier,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(toolOutput).toContain(VISIBLE_COMPANY_NAME);
    expect(toolOutput).toContain(HIDDEN_COMPANY_NAME);
  }, 60000);

  it('does not let a workspace agent read an object the member cannot read', async () => {
    const toolOutput = await runAgent({
      executeToolCall: FIND_OPPORTUNITIES,
      agentUniversalIdentifier: workspaceAgentUniversalIdentifier,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(toolOutput).toContain('is not available');
    expect(toolOutput).not.toContain(OPPORTUNITY_NAME);
  }, 60000);

  it('does not let a share to the calling application reach past the member and agent roles on a run-as', async () => {
    const recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );
    const [{ id: companyObjectMetadataId }] =
      await globalThis.testDataSource.query(
        `SELECT id FROM core."objectMetadata" WHERE "nameSingular" = 'company' AND "workspaceId" = $1`,
        [SEED_APPLE_WORKSPACE_ID],
      );
    const [{ defaultRoleId: applicationRoleId }] =
      await globalThis.testDataSource.query(
        `SELECT "defaultRoleId" FROM core.application WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
        [APP_ID, SEED_APPLE_WORKSPACE_ID],
      );

    await recordShareStorageService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          objectMetadataId: companyObjectMetadataId,
          recordId: HIDDEN_COMPANY_ID,
          principalId: applicationRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: HIDDEN_COMPANY_ID,
        },
      ],
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });

    try {
      const toolOutput = await runAgent({
        executeToolCall: FIND_COMPANIES,
        runAsWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      expect(toolOutput).toContain(VISIBLE_COMPANY_NAME);
      expect(toolOutput).not.toContain(HIDDEN_COMPANY_NAME);
    } finally {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: false,
        expectToFail: false,
      });
      await recordShareStorageService.deleteByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: companyObjectMetadataId,
        recordIds: [HIDDEN_COMPANY_ID],
      });
    }
  }, 60000);
});
