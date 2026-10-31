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
  updateCoreWorkflowVersionStep,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { waitForWorkflowCompletion } from 'test/integration/graphql/suites/workflow/utils/workflow-run-test.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
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

import { type InlineWorkflowStepAgentsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793472502616-inline-workflow-step-agents.command';
import {
  type AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
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
const CONVERSATIONAL_WORKFLOW_NAME = 'Reviewed company summary';

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

const withStepInput = (
  step: AiAgentStep,
  input: Record<string, unknown>,
): AiAgentStep => ({
  ...step,
  settings: { ...step.settings, input: { ...step.settings.input, ...input } },
});

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
    } as unknown as RegisteredAiModel);

  return calls;
};

describe('2-55 workspace command - inline workflow step agents (integration)', () => {
  let command: InlineWorkflowStepAgentsCommand;
  let stepAgentRoleId: string;
  let workspaceCustomApplicationId: string;
  let generateWorkflow: LegacyAiStepWorkflow;
  let conversationalWorkflow: LegacyAiStepWorkflow;
  let seededSystemAgents: { id: string; label: string }[];
  const coreWorkflowIds: string[] = [];
  const workspaceWorkflowIds: string[] = [];
  const agentIds: string[] = [];
  const pausedRunId = randomUUID();
  const wakeUpId = randomUUID();

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

  const readPausedRun = async () => {
    const [{ state }] = await global.testDataSource.query(
      `SELECT state FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
      [pausedRunId],
    );
    const [{ payload }] = await global.testDataSource.query(
      `SELECT payload FROM core."pendingWakeUp" WHERE id = $1`,
      [wakeUpId],
    );

    return { steps: state.flow.steps, runSpec: payload.runSpec };
  };

  const readAgent = async (
    agentId: string,
  ): Promise<{ isSystem: boolean; label: string }> => {
    const [agent] = await global.testDataSource.query(
      `SELECT "isSystem", label FROM core."agent" WHERE id = $1`,
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
    pausedRun: await readPausedRun(),
    generateAgent: await readAgent(generateWorkflow.agentId),
    conversationalAgent: await readAgent(conversationalWorkflow.agentId),
  });

  // the step agent is built by the step builder, then edited the way the step panel did
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
    const agentId = String(createdStep.settings.input.agentId);

    agentIds.push(agentId);

    await updateOneAgent({
      expectToFail: false,
      input: {
        id: agentId,
        prompt: STEP_AGENT_INSTRUCTIONS,
        modelId: TEST_AI_MODEL_ID,
        modelConfiguration: STEP_AGENT_MODEL_CONFIGURATION,
        responseFormat: STEP_AGENT_RESPONSE_FORMAT,
        roleId: stepAgentRoleId,
      },
    });
    await updateCoreWorkflowVersionStep({
      coreWorkflowVersionId,
      step: {
        ...withStepInput(createdStep, stepInput),
        name: STEP_NAME,
      },
    });

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

    [{ workspaceCustomApplicationId }] = await global.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
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
      name: CONVERSATIONAL_WORKFLOW_NAME,
      stepInput: {
        prompt: STEP_PROMPT,
        humanInputInstructions: 'Have a person approve the summary',
      },
    });

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, position)
       VALUES ($1, 'Paused company summary', $2, $3, $4, $5, 'RUNNING', $6, 0)`,
      [
        pausedRunId,
        generateWorkflow.workspaceWorkflowId,
        generateWorkflow.workspaceWorkflowVersionId,
        generateWorkflow.coreWorkflowId,
        generateWorkflow.coreWorkflowVersionId,
        JSON.stringify({
          flow: { trigger: MANUAL_TRIGGER, steps: [generateWorkflow.step] },
          stepInfos: {
            trigger: { status: 'SUCCESS', result: {} },
            [generateWorkflow.step.id]: { status: 'RUNNING' },
          },
        }),
      ],
    );
    await global.testDataSource.query(
      `INSERT INTO "core"."pendingWakeUp" (id, "workspaceId", "ownerType", "ownerId", "ownerKey", condition, payload)
       VALUES ($1, $2, 'AGENT_RUN', $3, 'RUN', $4::jsonb, $5::jsonb)`,
      [
        wakeUpId,
        SEED_APPLE_WORKSPACE_ID,
        randomUUID(),
        JSON.stringify({ type: 'ANSWER', threadId: randomUUID() }),
        JSON.stringify({
          caller: {
            type: 'WORKFLOW_STEP',
            ref: {
              workflowRunId: pausedRunId,
              stepId: generateWorkflow.step.id,
            },
          },
          runSpec: { agentId: generateWorkflow.agentId, title: STEP_NAME },
          summary: null,
          continuationCount: 0,
        }),
      ],
    );

    seededSystemAgents = await global.testDataSource.query(
      `SELECT id, label FROM core."agent"
       WHERE "workspaceId" = $1 AND "isSystem" = true AND NOT (id = ANY($2::uuid[]))`,
      [SEED_APPLE_WORKSPACE_ID, agentIds],
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "core"."pendingWakeUp" WHERE id = $1`,
      [wakeUpId],
    );
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

    const [remainingRole] = await global.testDataSource.query(
      `SELECT id FROM core."role" WHERE id = $1`,
      [stepAgentRoleId],
    );

    if (remainingRole !== undefined) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: stepAgentRoleId },
      });
    }

    // the command also reveals the conversational step agents the dev seed creates
    await global.testDataSource.query(
      `UPDATE core."agent" AS agent SET "isSystem" = true, label = seeded.label
       FROM jsonb_to_recordset($1::jsonb) AS seeded(id uuid, label text)
       WHERE agent.id = seeded.id`,
      [JSON.stringify(seededSystemAgents)],
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

  it('keeps the agent of a step with human input and makes it visible under its workflow and step names', async () => {
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
      label: `${CONVERSATIONAL_WORKFLOW_NAME} · ${STEP_NAME}`,
    });
  });

  it('inlines the step agent in the saved flow of a paused run and in the spec it resumes from', async () => {
    expect(await readPausedRun()).toEqual({
      steps: [inlineStepAgentOf(generateWorkflow.step)],
      runSpec: {
        title: STEP_NAME,
        agentId: null,
        inlineConfig: {
          instructions: STEP_AGENT_INSTRUCTIONS,
          modelId: TEST_AI_MODEL_ID,
          modelConfiguration: STEP_AGENT_MODEL_CONFIGURATION,
          scope: STEP_AGENT_ROLE_SCOPE,
          applicationId: workspaceCustomApplicationId,
          promptCacheKey: `workflow-step:${generateWorkflow.step.id}`,
        },
        responseFormat: STEP_AGENT_RESPONSE_FORMAT,
      },
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

  it('leaves a step edited while it was being inlined for the next run', async () => {
    const editedWorkflow = await createLegacyAiStepWorkflow({
      name: 'Company summary edited mid-upgrade',
      stepInput: { prompt: STEP_PROMPT },
    });
    const editedStep = withStepInput(editedWorkflow.step, {
      prompt: 'Summarize the company in one line',
    });
    const query = global.testDataSource.query.bind(global.testDataSource);

    jest
      .spyOn(global.testDataSource, 'query')
      .mockImplementation(async (sql: string, parameters?: unknown[]) => {
        if (sql.startsWith('UPDATE core."workflowVersion" AS target')) {
          await query(
            `UPDATE core."workflowVersion" SET steps = $2 WHERE id = $1`,
            [
              editedWorkflow.coreWorkflowVersionId,
              JSON.stringify([editedStep]),
            ],
          );
        }

        return query(sql, parameters);
      });

    await runCommand();

    jest.restoreAllMocks();

    expect(await readCoreSteps(editedWorkflow.coreWorkflowVersionId)).toEqual([
      editedStep,
    ]);

    await runCommand();

    expect(await readCoreSteps(editedWorkflow.coreWorkflowVersionId)).toEqual([
      inlineStepAgentOf(editedStep),
    ]);
  });
});
