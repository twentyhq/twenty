import { randomUUID } from 'node:crypto';

import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import {
  activateCoreWorkflowVersion,
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  deleteLegacyWorkspaceWorkflowRecords,
  linkCoreWorkflowToLegacyWorkspaceIds,
  runCoreWorkflowVersion,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { waitForWorkflowCompletion } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createScriptedLanguageModel } from 'test/utils/create-scripted-language-model.util';
import {
  type AgentResponseFormat,
  type AiRunScope,
  type ModelConfiguration,
} from 'twenty-shared/ai';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793697418665-inline-workflow-step-agents.command';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AgentRunPersonaService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-persona.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const COMPANY = STANDARD_OBJECTS.company;

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

const STEP_NAME = 'Summarize the company';
const STEP_PROMPT = 'Summarize the company you were given';

const STEP_AGENT_INSTRUCTIONS = 'You write short company summaries.';

const STEP_AGENT_MODEL_CONFIGURATION: ModelConfiguration = {
  webSearch: { enabled: false },
};

const STEP_AGENT_RESPONSE_FORMAT: AgentResponseFormat = {
  type: 'json',
  schema: {
    type: 'object',
    properties: { summary: { type: 'string', description: 'The summary' } },
    required: ['summary'],
    additionalProperties: false,
  },
};

const STEP_AGENT_ROLE_SCOPE: AiRunScope = {
  objectPermissions: [
    {
      objectUniversalIdentifier: COMPANY.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: COMPANY.universalIdentifier,
      fieldUniversalIdentifier:
        COMPANY.fields.annualRevenue.universalIdentifier,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag[PermissionFlagType.HTTP_REQUEST_TOOL],
  ],
};

const USAGE = {
  inputTokens: {
    total: 1,
    noCache: 1,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

type AiAgentStep = {
  id: string;
  type: string;
  name?: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

type LegacyAiStepWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string;
  workspaceWorkflowVersionId: string;
  step: AiAgentStep;
  agentId: string;
};

type ModelCall = {
  systemPrompt: string;
  offeredToolNames: string[];
};

const inlineStepAgentOf = ({
  settings: {
    input: { agentId: _agentId, ...input },
    ...settings
  },
  ...step
}: AiAgentStep): AiAgentStep => ({
  ...step,
  settings: {
    ...settings,
    input: {
      ...input,
      instructions: STEP_AGENT_INSTRUCTIONS,
      modelId: TEST_AI_MODEL_ID,
      modelConfiguration: STEP_AGENT_MODEL_CONFIGURATION,
      scope: STEP_AGENT_ROLE_SCOPE,
      responseFormat: STEP_AGENT_RESPONSE_FORMAT,
    },
  },
});

const scriptModelAnsweringASummary = (): ModelCall[] => {
  const calls: ModelCall[] = [];
  const model = createScriptedLanguageModel((options) => {
    calls.push({
      systemPrompt: options.prompt
        .flatMap((message) =>
          message.role === 'system' ? [message.content] : [],
        )
        .join('\n'),
      offeredToolNames: (options.tools ?? []).map((tool) => tool.name),
    });

    return {
      content: [{ type: 'text', text: JSON.stringify({ summary: 'Done' }) }],
      finishReason: { unified: 'stop', raw: undefined },
      usage: USAGE,
    };
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
    });

  return calls;
};

describe('2-56 workspace command - inline workflow step agents (integration)', () => {
  let command: InlineWorkflowStepAgentsCommand;
  let stepAgentRoleId: string;
  const roleIds: string[] = [];
  let generateWorkflow: LegacyAiStepWorkflow;
  let conversationalWorkflow: LegacyAiStepWorkflow;
  let seededSystemAgentIds: string[];
  const coreWorkflowIds: string[] = [];
  const workspaceWorkflowIds: string[] = [];
  const agentIds: string[] = [];

  const runCommand = () =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readCoreSteps = async (
    coreWorkflowVersionId: string,
  ): Promise<AiAgentStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    return steps;
  };

  const readWorkspaceSteps = async (
    workspaceWorkflowVersionId: string,
  ): Promise<AiAgentStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM ${SCHEMA}."workflowVersion" WHERE id = $1`,
      [workspaceWorkflowVersionId],
    );

    return steps;
  };

  const readAgent = async (agentId: string): Promise<{ isSystem: boolean }> => {
    const [agent] = await global.testDataSource.query(
      `SELECT "isSystem" FROM core."agent" WHERE id = $1`,
      [agentId],
    );

    return agent;
  };

  const readMigratedRows = async () => ({
    generateCoreSteps: await readCoreSteps(
      generateWorkflow.coreWorkflowVersionId,
    ),
    generateWorkspaceSteps: await readWorkspaceSteps(
      generateWorkflow.workspaceWorkflowVersionId,
    ),
    conversationalCoreSteps: await readCoreSteps(
      conversationalWorkflow.coreWorkflowVersionId,
    ),
    generateAgent: await readAgent(generateWorkflow.agentId),
    conversationalAgent: await readAgent(conversationalWorkflow.agentId),
  });

  const createLegacyAiStepWorkflow = async ({
    name,
    stepInput,
  }: {
    name: string;
    stepInput: Record<string, unknown>;
  }): Promise<LegacyAiStepWorkflow> => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name,
    });

    coreWorkflowIds.push(coreWorkflowId);

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: MANUAL_TRIGGER,
    });

    const createdStep = await createCoreWorkflowVersionStep<AiAgentStep>({
      coreWorkflowVersionId,
      stepType: 'AI_AGENT',
    });
    const { data } = await createOneAgent({
      expectToFail: false,
      input: {
        label: `Workflow Agent ${randomUUID().substring(0, 4)}`,
        prompt: STEP_AGENT_INSTRUCTIONS,
        modelId: TEST_AI_MODEL_ID,
        modelConfiguration: STEP_AGENT_MODEL_CONFIGURATION,
        responseFormat: STEP_AGENT_RESPONSE_FORMAT,
        roleId: stepAgentRoleId,
      },
    });
    const agentId = data.createOneAgent.id;

    agentIds.push(agentId);

    // the builder no longer gives a step its own hidden agent, so the legacy shape is written as it left it
    const legacyStep: AiAgentStep = {
      ...createdStep,
      name: STEP_NAME,
      settings: {
        ...createdStep.settings,
        input: { agentId, prompt: '', ...stepInput },
      },
    };

    await global.testDataSource.query(
      `UPDATE core."agent" SET "isSystem" = true WHERE id = $1`,
      [agentId],
    );
    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb WHERE id = $1`,
      [coreWorkflowVersionId, JSON.stringify([legacyStep])],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatAgentMaps', 'flatWorkflowVersionMaps'],
    );

    const {
      workspaceWorkflowId,
      workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
    } = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
      withWorkspaceRecords: true,
    });

    workspaceWorkflowIds.push(workspaceWorkflowId);

    const [step] = await readCoreSteps(coreWorkflowVersionId);

    return {
      coreWorkflowId,
      coreWorkflowVersionId,
      workspaceWorkflowId,
      workspaceWorkflowVersionId,
      step,
      agentId,
    };
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<InlineWorkflowStepAgentsCommand>(
      'InlineWorkflowStepAgentsCommand',
    );

    const [{ objectMetadataId, fieldMetadataId }] =
      await global.testDataSource.query(
        `SELECT object.id AS "objectMetadataId", field.id AS "fieldMetadataId"
         FROM core."objectMetadata" object
         JOIN core."fieldMetadata" field ON field."objectMetadataId" = object.id
         WHERE object."workspaceId" = $1 AND object."universalIdentifier" = $2
           AND field."universalIdentifier" = $3`,
        [
          SEED_APPLE_WORKSPACE_ID,
          COMPANY.universalIdentifier,
          COMPANY.fields.annualRevenue.universalIdentifier,
        ],
      );

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Inline step agents step role',
        description: 'The role a builder step gave its hidden agent',
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

    stepAgentRoleId = roleData.createOneRole.id;
    roleIds.push(stepAgentRoleId);

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: stepAgentRoleId,
        objectPermissions: [
          {
            objectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });
    await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: stepAgentRoleId,
        fieldPermissions: [
          {
            objectMetadataId,
            fieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });
    await upsertPermissionFlags({
      expectToFail: false,
      input: {
        roleId: stepAgentRoleId,
        permissionFlagKeys: [PermissionFlagType.HTTP_REQUEST_TOOL],
      },
    });

    generateWorkflow = await createLegacyAiStepWorkflow({
      name: 'Company summary',
      stepInput: { prompt: STEP_PROMPT },
    });
    conversationalWorkflow = await createLegacyAiStepWorkflow({
      name: 'Reviewed company summary',
      stepInput: {
        prompt: STEP_PROMPT,
        humanInputInstructions: 'Have a person approve the summary',
      },
    });

    const seededSystemAgents: { id: string }[] =
      await global.testDataSource.query(
        `SELECT id FROM core."agent"
         WHERE "workspaceId" = $1 AND "isSystem" = true AND NOT (id = ANY($2::uuid[]))`,
        [SEED_APPLE_WORKSPACE_ID, agentIds],
      );

    seededSystemAgentIds = seededSystemAgents.map(({ id }) => id);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE "coreWorkflowId" = ANY($1::uuid[])`,
      [coreWorkflowIds],
    );
    await deleteCoreWorkflows({ coreWorkflowIds });

    for (const workspaceWorkflowId of workspaceWorkflowIds) {
      await deleteLegacyWorkspaceWorkflowRecords({ workspaceWorkflowId });
    }

    const remainingAgents: { id: string }[] = await global.testDataSource.query(
      `SELECT id FROM core."agent" WHERE id = ANY($1::uuid[])`,
      [agentIds],
    );

    for (const { id } of remainingAgents) {
      await deleteOneAgent({ expectToFail: false, input: { id } });
    }

    for (const roleId of roleIds) {
      const [remainingRole] = await global.testDataSource.query(
        `SELECT id FROM core."role" WHERE id = $1`,
        [roleId],
      );

      if (isDefined(remainingRole)) {
        await deleteOneRole({
          expectToFail: false,
          input: { idToDelete: roleId },
        });
      }
    }

    // the command also reveals the conversational step agents the dev seed creates
    await global.testDataSource.query(
      `UPDATE core."agent" SET "isSystem" = true WHERE id = ANY($1::uuid[])`,
      [seededSystemAgentIds],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatAgentMaps'],
    );
  });

  it('moves the instructions, model, response format and role of a step agent into the step', async () => {
    await runCommand();

    const inlinedStep = inlineStepAgentOf(generateWorkflow.step);

    expect(await readCoreSteps(generateWorkflow.coreWorkflowVersionId)).toEqual(
      [inlinedStep],
    );
    expect(
      await readWorkspaceSteps(generateWorkflow.workspaceWorkflowVersionId),
    ).toEqual([inlinedStep]);
    expect(await readAgent(generateWorkflow.agentId)).toMatchObject({
      isSystem: true,
    });
  });

  it('keeps the agent of a step with human input and makes it visible', async () => {
    expect(
      await readCoreSteps(conversationalWorkflow.coreWorkflowVersionId),
    ).toEqual([conversationalWorkflow.step]);
    expect(
      await readWorkspaceSteps(
        conversationalWorkflow.workspaceWorkflowVersionId,
      ),
    ).toEqual([conversationalWorkflow.step]);
    expect(await readAgent(conversationalWorkflow.agentId)).toEqual({
      isSystem: false,
    });
  });

  it('changes nothing when run again', async () => {
    const migratedRows = await readMigratedRows();

    await runCommand();

    expect(await readMigratedRows()).toEqual(migratedRows);
  });

  it('activates the inlined workflow and runs its step with the instructions and scope of the former agent', async () => {
    const calls = scriptModelAnsweringASummary();

    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: generateWorkflow.coreWorkflowVersionId,
    });

    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: generateWorkflow.coreWorkflowVersionId,
    });

    expect((await waitForWorkflowCompletion(workflowRunId))?.status).toBe(
      'COMPLETED',
    );
    expect(calls[0].systemPrompt).toContain(STEP_AGENT_INSTRUCTIONS);
    expect(calls[0].offeredToolNames).toEqual(
      expect.arrayContaining(['find_many_companies', 'http_request']),
    );
    expect(calls[0].offeredToolNames).not.toContain('find_many_people');
  });

  it('keeps an archived step agent visible, so its step still stops and the agent can be restored', async () => {
    const archivedWorkflow = await createLegacyAiStepWorkflow({
      name: 'Company summary with an archived agent',
      stepInput: { prompt: STEP_PROMPT },
    });

    await global.testDataSource.query(
      `UPDATE core."agent" SET "isActive" = false WHERE id = $1`,
      [archivedWorkflow.agentId],
    );
    await global.workflowTestServices.workspaceCache.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatAgentMaps'],
    );

    await runCommand();

    expect(await readCoreSteps(archivedWorkflow.coreWorkflowVersionId)).toEqual(
      [archivedWorkflow.step],
    );
    expect(await readAgent(archivedWorkflow.agentId)).toMatchObject({
      isSystem: false,
    });
    await expect(
      getAppProviderByClassName<AgentRunPersonaService>(
        'AgentRunPersonaService',
      ).resolveOrThrow({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        spec: { agentId: archivedWorkflow.agentId },
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.AGENT_IS_INACTIVE });
  });

  it('keeps a step agent whose role has row-level predicates and makes it visible', async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Inline step agents row-level role',
        description: 'A step agent role a scope cannot express',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });
    const rowLevelRoleId = roleData.createOneRole.id;

    roleIds.push(rowLevelRoleId);

    const [{ objectMetadataId, fieldMetadataId }] =
      await global.testDataSource.query(
        `SELECT object.id AS "objectMetadataId", field.id AS "fieldMetadataId"
         FROM core."objectMetadata" object
         JOIN core."fieldMetadata" field ON field."objectMetadataId" = object.id
         WHERE object."workspaceId" = $1 AND object."universalIdentifier" = $2
           AND field."universalIdentifier" = $3`,
        [
          SEED_APPLE_WORKSPACE_ID,
          COMPANY.universalIdentifier,
          COMPANY.fields.name.universalIdentifier,
        ],
      );

    await upsertRowLevelPermissionPredicates({
      expectToFail: false,
      input: {
        roleId: rowLevelRoleId,
        objectMetadataId,
        predicates: [
          {
            fieldMetadataId,
            operand: RowLevelPermissionPredicateOperand.CONTAINS,
            value: 'Acme',
          },
        ],
        predicateGroups: [],
      },
    });

    const rowLevelWorkflow = await createLegacyAiStepWorkflow({
      name: 'Company summary limited to some companies',
      stepInput: { prompt: STEP_PROMPT },
    });

    await updateOneAgent({
      expectToFail: false,
      input: { id: rowLevelWorkflow.agentId, roleId: rowLevelRoleId },
    });

    await runCommand();

    expect(await readCoreSteps(rowLevelWorkflow.coreWorkflowVersionId)).toEqual(
      [rowLevelWorkflow.step],
    );
    expect(await readAgent(rowLevelWorkflow.agentId)).toEqual({
      isSystem: false,
    });
  });
});
