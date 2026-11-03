import { randomUUID } from 'node:crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
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
import { UNRECOVERABLE_CODE_STEP_SOURCE } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER = randomUUID();
const OTHER_APPLICATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER = randomUUID();

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
  step: {
    settings: {
      input: { logicFunctionId: _logicFunctionId, ...input },
      ...settings
    },
    ...step
  },
  code = SOURCE,
}: {
  step: CodeStep;
  code?: string;
}): CodeStep => ({
  ...step,
  settings: { ...settings, input: { ...input, code } },
});

describe('2-56 workspace command - inline code step sources (integration)', () => {
  let command: InlineCodeStepSourcesCommand;
  let legacyWorkflow: LegacyCodeStepWorkflow;
  let inFlightWorkflow: LegacyCodeStepWorkflow;
  let missingFunctionWorkflow: LegacyCodeStepWorkflow;
  let otherApplicationWorkflow: LegacyCodeStepWorkflow;
  let orphanLogicFunctionId: string;
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

  const createOtherApplicationLogicFunction = async (): Promise<string> => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Inline code step sources test app',
      description: 'Owns a function a legacy code step references',
      sourcePath: 'inline-code-step-sources-test-app',
    });

    jest.useRealTimers();

    for (const { fileFolder, filePath } of [
      { fileFolder: 'Source', filePath: 'src/greet.ts' },
      { fileFolder: 'BuiltLogicFunction', filePath: 'src/greet.mjs' },
    ]) {
      await uploadApplicationFile({
        applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
        fileFolder,
        filePath,
        fileBuffer: Buffer.from(SOURCE),
        filename: filePath.split('/').pop() ?? filePath,
        contentType: 'text/plain',
        expectToFail: false,
      });
    }

    await syncApplication({
      manifest: buildBaseManifest({
        appId: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: randomUUID(),
        overrides: {
          logicFunctions: [
            {
              universalIdentifier:
                OTHER_APPLICATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
              name: 'A Code Step',
              sourceHandlerPath: 'src/greet.ts',
              builtHandlerPath: 'src/greet.mjs',
              builtHandlerChecksum: 'checksum',
              handlerName: 'main',
            },
          ],
        },
      }),
      expectToFail: false,
    });

    const [{ id }] = await global.testDataSource.query(
      `SELECT id FROM core."logicFunction" WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [
        OTHER_APPLICATION_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );

    return id;
  };

  const createLegacyCodeStepWorkflow = async ({
    name,
    logicFunctionId,
  }: {
    name: string;
    logicFunctionId: string;
  }): Promise<LegacyCodeStepWorkflow> => {
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

    legacyWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with code',
      logicFunctionId: await createLogicFunction('A Code Step'),
    });
    inFlightWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with code while running',
      logicFunctionId: await createLogicFunction('A Code Step'),
    });
    missingFunctionWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with lost code',
      logicFunctionId: randomUUID(),
    });
    otherApplicationWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with application code',
      logicFunctionId: await createOtherApplicationLogicFunction(),
    });
    orphanLogicFunctionId = await createLogicFunction('A Code Step');

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

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });
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
    expect(
      await readCoreSteps(missingFunctionWorkflow.coreWorkflowVersionId),
    ).toEqual([missingFunctionWorkflow.step]);
  });

  it('moves the source of a legacy code step into the step and deletes its function', async () => {
    await runCommand();

    const inlinedStep = inlinedStepOf({ step: legacyWorkflow.step });

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
      [inlinedStepOf({ step: inFlightWorkflow.step })],
    );
    expect(await logicFunctionExists(inFlightWorkflow.logicFunctionId)).toBe(
      true,
    );
  });

  it('replaces a step whose function is missing with code that throws', async () => {
    expect(
      await readCoreSteps(missingFunctionWorkflow.coreWorkflowVersionId),
    ).toEqual([
      inlinedStepOf({
        step: missingFunctionWorkflow.step,
        code: UNRECOVERABLE_CODE_STEP_SOURCE,
      }),
    ]);
  });

  it('inlines the source of a function owned by another application, and keeps the function', async () => {
    expect(
      await readCoreSteps(otherApplicationWorkflow.coreWorkflowVersionId),
    ).toEqual([inlinedStepOf({ step: otherApplicationWorkflow.step })]);
    expect(
      await logicFunctionExists(otherApplicationWorkflow.logicFunctionId),
    ).toBe(true);
  });

  it('keeps a function no step references, whatever its name', async () => {
    expect(await logicFunctionExists(orphanLogicFunctionId)).toBe(true);
  });

  it('changes nothing on a second run', async () => {
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET status = 'COMPLETED' WHERE id = $1`,
      [inFlightRunId],
    );

    await runCommand();

    expect(await readCoreSteps(legacyWorkflow.coreWorkflowVersionId)).toEqual([
      inlinedStepOf({ step: legacyWorkflow.step }),
    ]);
    expect(await logicFunctionExists(inFlightWorkflow.logicFunctionId)).toBe(
      true,
    );
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
