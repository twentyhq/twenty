import { randomUUID } from 'node:crypto';

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
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { deleteLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type InlineCodeStepSourcesCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793717835616-inline-code-step-sources.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const MANUAL_TRIGGER = {
  name: 'Manual Trigger',
  type: 'MANUAL',
  settings: { outputSchema: {} },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

const SOURCE = `export const main = async (params: { name: string }) => ({
  greeting: \`Hello \${params.name}\`,
});`;

type CodeStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

type LegacyCodeStepWorkflow = {
  coreWorkflowId: string;
  coreWorkflowVersionId: string;
  workspaceWorkflowId: string;
  workspaceWorkflowVersionId: string;
  step: CodeStep;
  logicFunctionId: string;
};

const inlinedStepOf = ({
  settings: {
    input: { logicFunctionId: _logicFunctionId, ...input },
    ...settings
  },
  ...step
}: CodeStep): CodeStep => ({
  ...step,
  settings: { ...settings, input: { ...input, code: SOURCE } },
});

describe('2-56 workspace command - inline code step sources (integration)', () => {
  let command: InlineCodeStepSourcesCommand;
  let legacyWorkflow: LegacyCodeStepWorkflow;
  let inFlightWorkflow: LegacyCodeStepWorkflow;
  let orphanLogicFunctionId: string;
  let userLogicFunctionId: string;
  const inFlightRunId = randomUUID();
  const coreWorkflowIds: string[] = [];
  const workspaceWorkflowIds: string[] = [];
  const logicFunctionIds: string[] = [];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readCoreSteps = async (
    coreWorkflowVersionId: string,
  ): Promise<CodeStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    return steps;
  };

  const readWorkspaceSteps = async (
    workspaceWorkflowVersionId: string,
  ): Promise<CodeStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM ${SCHEMA}."workflowVersion" WHERE id = $1`,
      [workspaceWorkflowVersionId],
    );

    return steps;
  };

  const logicFunctionExists = async (logicFunctionId: string) =>
    (
      await global.testDataSource.query(
        `SELECT id FROM core."logicFunction" WHERE id = $1`,
        [logicFunctionId],
      )
    ).length === 1;

  const createLogicFunction = async (name: string): Promise<string> => {
    const { data } = await createOneLogicFunction({
      expectToFail: false,
      input: {
        name,
        source: { sourceHandlerCode: SOURCE, handlerName: 'main' },
      },
    });
    const logicFunctionId = data.createOneLogicFunction.id;

    logicFunctionIds.push(logicFunctionId);

    return logicFunctionId;
  };

  const createLegacyCodeStepWorkflow = async (
    name: string,
  ): Promise<LegacyCodeStepWorkflow> => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name,
    });

    coreWorkflowIds.push(coreWorkflowId);

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: MANUAL_TRIGGER,
    });

    const createdStep = await createCoreWorkflowVersionStep<CodeStep>({
      coreWorkflowVersionId,
      stepType: 'CODE',
    });
    const logicFunctionId = await createLogicFunction('A Code Step');

    // the builder no longer gives a step its own logic function, so the legacy shape is written as it left it
    const {
      settings: {
        input: { code: _code, ...input },
      },
    } = createdStep;
    const legacyStep: CodeStep = {
      ...createdStep,
      settings: {
        ...createdStep.settings,
        input: {
          ...input,
          logicFunctionId,
          logicFunctionInput: { name: 'Ada' },
        },
      },
    };

    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb WHERE id = $1`,
      [coreWorkflowVersionId, JSON.stringify([legacyStep])],
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
      logicFunctionId,
    };
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<InlineCodeStepSourcesCommand>(
      'InlineCodeStepSourcesCommand',
    );

    legacyWorkflow = await createLegacyCodeStepWorkflow('Greet with code');
    inFlightWorkflow = await createLegacyCodeStepWorkflow(
      'Greet with code while running',
    );
    orphanLogicFunctionId = await createLogicFunction('A Code Step');
    userLogicFunctionId = await createLogicFunction('Greet someone');

    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, position)
       VALUES ($1, 'In-flight legacy code step run', $2, $3, $4, $5, 'RUNNING', $6, 0)`,
      [
        inFlightRunId,
        inFlightWorkflow.workspaceWorkflowId,
        inFlightWorkflow.workspaceWorkflowVersionId,
        inFlightWorkflow.coreWorkflowId,
        inFlightWorkflow.coreWorkflowVersionId,
        JSON.stringify({
          flow: { trigger: MANUAL_TRIGGER, steps: [inFlightWorkflow.step] },
          stepInfos: {
            trigger: { status: 'SUCCESS', result: {} },
            [inFlightWorkflow.step.id]: { status: 'NOT_STARTED' },
          },
        }),
      ],
    );
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

    for (const logicFunctionId of logicFunctionIds) {
      if (await logicFunctionExists(logicFunctionId)) {
        await deleteLogicFunction({
          expectToFail: false,
          input: { id: logicFunctionId },
        });
      }
    }
  });

  it('changes nothing in a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readCoreSteps(legacyWorkflow.coreWorkflowVersionId)).toEqual([
      legacyWorkflow.step,
    ]);
    expect(
      await readWorkspaceSteps(legacyWorkflow.workspaceWorkflowVersionId),
    ).toEqual([legacyWorkflow.step]);
    expect(await logicFunctionExists(legacyWorkflow.logicFunctionId)).toBe(
      true,
    );
    expect(await logicFunctionExists(orphanLogicFunctionId)).toBe(true);
  });

  it('moves the source of a legacy code step into the step and deletes its function', async () => {
    await runCommand();

    const inlinedStep = inlinedStepOf(legacyWorkflow.step);

    expect(await readCoreSteps(legacyWorkflow.coreWorkflowVersionId)).toEqual([
      inlinedStep,
    ]);
    expect(
      await readWorkspaceSteps(legacyWorkflow.workspaceWorkflowVersionId),
    ).toEqual([inlinedStep]);
    expect(await logicFunctionExists(legacyWorkflow.logicFunctionId)).toBe(
      false,
    );
  });

  it('keeps the function an in-flight run still references', async () => {
    expect(await readCoreSteps(inFlightWorkflow.coreWorkflowVersionId)).toEqual(
      [inlinedStepOf(inFlightWorkflow.step)],
    );
    expect(await logicFunctionExists(inFlightWorkflow.logicFunctionId)).toBe(
      true,
    );
  });

  it('deletes a code step function no step references anymore, but not a function of the user', async () => {
    expect(await logicFunctionExists(orphanLogicFunctionId)).toBe(false);
    expect(await logicFunctionExists(userLogicFunctionId)).toBe(true);
  });

  it('deletes the function of an in-flight run once the run is over', async () => {
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET status = 'COMPLETED' WHERE id = $1`,
      [inFlightRunId],
    );

    await runCommand();

    expect(await logicFunctionExists(inFlightWorkflow.logicFunctionId)).toBe(
      false,
    );
    expect(await readCoreSteps(legacyWorkflow.coreWorkflowVersionId)).toEqual([
      inlinedStepOf(legacyWorkflow.step),
    ]);
  });

  it('runs the inlined step', async () => {
    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: legacyWorkflow.coreWorkflowVersionId,
    });

    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: legacyWorkflow.coreWorkflowVersionId,
    });
    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('COMPLETED');
    expect(
      workflowRun?.state?.stepInfos?.[legacyWorkflow.step.id]?.result,
    ).toEqual({ greeting: 'Hello Ada' });
  });
});
