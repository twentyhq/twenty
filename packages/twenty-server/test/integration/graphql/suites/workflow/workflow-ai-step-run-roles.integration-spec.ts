import { randomUUID } from 'node:crypto';

import { APICallError } from '@ai-sdk/provider';

import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import {
  createCoreWorkflow,
  deleteCoreWorkflows,
  runCoreWorkflowVersion,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { waitForWorkflowCompletion } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const OBJECT_NAME = 'aiStepRunRoleRecord';
const OBJECT_PLURAL = 'aiStepRunRoleRecords';
const FIND_TOOL_NAME = 'find_many_ai_step_run_role_records';
const VISIBLE_RECORD_NAME = 'Visible to the member';
const HIDDEN_RECORD_NAME = 'Hidden from the member';

const USAGE = {
  inputTokens: {
    total: 1,
    noCache: 1,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

type ModelCall = {
  offeredToolNames: string[];
  toolOutputs: string[];
};

// The model calls the find tool once, then answers, so the test sees the tools the step offers and what they return
const mockModelCallingFindTool = ({
  failsOnceMidAnswer = false,
}: { failsOnceMidAnswer?: boolean } = {}): ModelCall[] => {
  const calls: ModelCall[] = [];
  const model = createScriptedLanguageModel((options) => {
    calls.push({
      offeredToolNames: (options.tools ?? []).map((tool) => tool.name),
      toolOutputs: options.prompt
        .filter((message) => message.role === 'tool')
        .flatMap((message) => message.content)
        .map((part) => JSON.stringify(part)),
    });

    if (calls.length === 1) {
      return {
        content: [
          {
            type: 'tool-call',
            toolCallId: 'find-1',
            toolName: FIND_TOOL_NAME,
            input: JSON.stringify({ select: ['id', 'name'] }),
            providerMetadata: { openai: { itemId: 'find-item' } },
          },
        ],
        finishReason: { unified: 'tool-calls', raw: undefined },
        usage: USAGE,
      };
    }

    if (failsOnceMidAnswer && calls.length === 2) {
      return {
        content: [{ type: 'text', text: 'Do' }],
        finishReason: { unified: 'error', raw: undefined },
        usage: USAGE,
        streamError: new APICallError({
          message: 'Service unavailable',
          url: 'https://provider.test',
          requestBodyValues: {},
          statusCode: 503,
        }),
      };
    }

    return {
      content: [{ type: 'text', text: 'Done' }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: USAGE,
    };
  });
  const aiModelRegistryService =
    getAppProviderByClassName<AiModelRegistryService>('AiModelRegistryService');

  jest.spyOn(aiModelRegistryService, 'resolveModelForAgent').mockReturnValue({
    modelId: TEST_AI_MODEL_ID,
    sdkPackage: '@ai-sdk/openai',
    model,
  } as unknown as RegisteredAiModel);

  return calls;
};

describe('workflow AI step when a member runs a workspace-owned workflow (integration)', () => {
  let objectMetadataId: string;
  let nameFieldMetadataId: string;
  let originalMemberRoleId: string;
  let memberRoleId: string;
  let agentRoleId: string;
  let agentId: string;
  const coreWorkflowIds: string[] = [];

  const setMemberObjectAccess = (canReadObjectRecords: boolean) =>
    upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords,
            canUpdateObjectRecords: canReadObjectRecords,
            canSoftDeleteObjectRecords: canReadObjectRecords,
            canDestroyObjectRecords: canReadObjectRecords,
          },
        ],
      },
    });

  const setMemberRowRule = (predicates: { value: string }[]) =>
    upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        objectMetadataId,
        predicates: predicates.map(({ value }) => ({
          fieldMetadataId: nameFieldMetadataId,
          operand: RowLevelPermissionPredicateOperand.CONTAINS,
          value,
        })),
        predicateGroups: [],
      },
    });

  const createAgentStepWorkflow = async (): Promise<string> => {
    const { coreWorkflowId, coreWorkflowVersionId, workspaceWorkflowId } =
      await createCoreWorkflow({ name: 'AI step run roles' });

    coreWorkflowIds.push(coreWorkflowId);

    const step = {
      id: randomUUID(),
      name: 'Read the records',
      type: WorkflowActionType.AI_AGENT,
      valid: true,
      nextStepIds: [],
      settings: {
        input: { agentId, prompt: 'List the records' },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    } as WorkflowAiAgentAction;
    const trigger = {
      name: 'Manual trigger',
      type: 'MANUAL',
      settings: { outputSchema: {} },
      nextStepIds: [step.id],
    };
    const [{ workspaceWorkflowVersionId }] = await global.testDataSource.query(
      `SELECT "workspaceWorkflowVersionId" FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET triggers = $2, steps = $3, status = 'ACTIVE' WHERE id = $1`,
      [
        coreWorkflowVersionId,
        JSON.stringify([trigger]),
        JSON.stringify([step]),
      ],
    );
    await global.testDataSource.query(
      `UPDATE "${schema}"."workflowVersion" SET trigger = $2, steps = $3, status = 'ACTIVE' WHERE id = $1`,
      [
        workspaceWorkflowVersionId,
        JSON.stringify(trigger),
        JSON.stringify([step]),
      ],
    );
    await global.testDataSource.query(
      `UPDATE "${schema}".workflow SET "lastPublishedVersionId" = $2 WHERE id = $1`,
      [workspaceWorkflowId, workspaceWorkflowVersionId],
    );
    await global.testDataSource.query(
      `UPDATE core.workflow SET "lastPublishedCoreWorkflowVersionId" = $2, "lastPublishedVersionId" = $3 WHERE id = $1`,
      [coreWorkflowId, coreWorkflowVersionId, workspaceWorkflowVersionId],
    );

    return coreWorkflowVersionId;
  };

  const runAsMemberUntilDone = async (coreWorkflowVersionId: string) => {
    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    return (await waitForWorkflowCompletion(workflowRunId))?.status;
  };

  beforeAll(async () => {
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data: memberRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'AI step run roles member',
        description: 'Member role that can run workflows',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    memberRoleId = memberRoleData.createOneRole.id;

    await upsertPermissionFlags({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        permissionFlagKeys: [PermissionFlagType.WORKFLOWS],
      },
    });
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: memberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });

    const { data: objectData } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_NAME,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'AI step run role record',
        labelPlural: 'AI step run role records',
        icon: 'IconRobot',
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id labelIdentifierFieldMetadataId',
    });

    objectMetadataId = objectData.createOneObject.id;
    nameFieldMetadataId =
      objectData.createOneObject.labelIdentifierFieldMetadataId!;

    for (const name of [VISIBLE_RECORD_NAME, HIDDEN_RECORD_NAME]) {
      await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id',
          data: { name },
        }),
      );
    }

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'AI step run roles agent',
        description: 'Agent role that can read the test records',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    agentRoleId = roleData.createOneRole.id;

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: agentRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    const { data: agentData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'AI step run roles agent',
        prompt: 'Read the records you are asked about',
        modelId: TEST_AI_MODEL_ID,
        roleId: agentRoleId,
      },
    });

    agentId = agentData.createOneAgent.id;
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await setMemberRowRule([]);
    await setMemberObjectAccess(true);
  });

  afterAll(async () => {
    for (const coreWorkflowId of coreWorkflowIds) {
      await global.testDataSource.query(
        `DELETE FROM "${schema}"."workflowRun" WHERE "coreWorkflowId" = $1`,
        [coreWorkflowId],
      );
    }
    await deleteCoreWorkflows({ coreWorkflowIds });
    await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
    await updateWorkspaceMemberRole({
      expectToFail: false,
      input: {
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      },
    });
    for (const roleId of [agentRoleId, memberRoleId]) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('refuses the step the records its member cannot read, even when its agent can', async () => {
    await setMemberObjectAccess(false);
    const calls = mockModelCallingFindTool();

    expect(await runAsMemberUntilDone(await createAgentStepWorkflow())).toBe(
      'COMPLETED',
    );

    expect(calls[0].offeredToolNames).not.toContain(FIND_TOOL_NAME);
    expect(calls[1].toolOutputs.join()).not.toContain(VISIBLE_RECORD_NAME);
    expect(calls[1].toolOutputs.join()).not.toContain(HIDDEN_RECORD_NAME);
  });

  it('applies the row rules of its member to what the step reads', async () => {
    await setMemberRowRule([{ value: 'Visible' }]);
    const calls = mockModelCallingFindTool();

    expect(await runAsMemberUntilDone(await createAgentStepWorkflow())).toBe(
      'COMPLETED',
    );

    expect(calls[0].offeredToolNames).toContain(FIND_TOOL_NAME);
    expect(calls[1].toolOutputs.join()).toContain(VISIBLE_RECORD_NAME);
    expect(calls[1].toolOutputs.join()).not.toContain(HIDDEN_RECORD_NAME);
  });

  const findSavedReplyParts = (): Promise<
    {
      type: string;
      state: string | null;
      textContent: string | null;
      hasToolOutput: boolean;
      providerMetadata: object | null;
    }[]
  > =>
    global.testDataSource.query(
      `SELECT part.type, part.state, part."textContent", part."toolOutput" IS NOT NULL AS "hasToolOutput",
         part."providerMetadata"
       FROM "${schema}"."agentMessagePart" part
       WHERE part."messageId" = (
         SELECT id FROM "${schema}"."agentMessage"
         WHERE role = 'assistant' ORDER BY "createdAt" DESC LIMIT 1
       )
       ORDER BY part."orderIndex"`,
    );

  it('saves the step reply in the parts chat saves', async () => {
    mockModelCallingFindTool();

    expect(await runAsMemberUntilDone(await createAgentStepWorkflow())).toBe(
      'COMPLETED',
    );

    expect(await findSavedReplyParts()).toMatchObject([
      { type: 'step-start' },
      {
        type: `tool-${FIND_TOOL_NAME}`,
        state: 'output-available',
        hasToolOutput: true,
        providerMetadata: { openai: { itemId: 'find-item' } },
      },
      { type: 'step-start' },
      { type: 'text', textContent: 'Done' },
    ]);
  });

  it('completes the step when the provider fails midway through an answer once', async () => {
    const calls = mockModelCallingFindTool({ failsOnceMidAnswer: true });

    expect(await runAsMemberUntilDone(await createAgentStepWorkflow())).toBe(
      'COMPLETED',
    );

    expect(calls).toHaveLength(3);

    const savedReplyParts = await findSavedReplyParts();

    expect(savedReplyParts[savedReplyParts.length - 1]).toMatchObject({
      type: 'text',
      textContent: 'Done',
    });
  });
});
