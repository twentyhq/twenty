import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';

import { FileFolder } from 'twenty-shared/types';
import { CODE_STEP_SOURCE_MAX_LENGTH } from 'twenty-shared/workflow';

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

import { type InlineCodeStepSourcesCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793797804387-inline-code-step-sources.command';
import { UNRECOVERABLE_CODE_STEP_SOURCE } from 'src/database/commands/upgrade-version-command/2-56/utils/inline-code-step-sources.util';
import { type FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
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

const OVERSIZED_SOURCE = `${SOURCE}
// ${'x'.repeat(CODE_STEP_SOURCE_MAX_LENGTH)}`;

const NUL_SOURCE = `${SOURCE}
// \0`;

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
  step,
  code = SOURCE,
}: {
  step: CodeStep;
  code?: string;
}): CodeStep => ({
  ...step,
  settings: { ...step.settings, input: { ...step.settings.input, code } },
});

describe('2-56 workspace command - inline code step sources (integration)', () => {
  let command: InlineCodeStepSourcesCommand;
  let legacyWorkflow: LegacyCodeStepWorkflow;
  let missingFunctionWorkflow: LegacyCodeStepWorkflow;
  let oversizedWorkflow: LegacyCodeStepWorkflow;
  let nulSourceWorkflow: LegacyCodeStepWorkflow;
  let unreadableSourceWorkflow: LegacyCodeStepWorkflow;
  let otherApplicationWorkflow: LegacyCodeStepWorkflow;
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

  const readSteps = async ({
    schema,
    workflowVersionId,
  }: {
    schema: string;
    workflowVersionId: string;
  }): Promise<CodeStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM ${schema}."workflowVersion" WHERE id = $1`,
      [workflowVersionId],
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

  const createLogicFunction = async (): Promise<string> => {
    const { data } = await createOneLogicFunction({
      expectToFail: false,
      input: {
        name: 'A Code Step',
        source: { sourceHandlerCode: SOURCE, handlerName: 'main' },
      },
    });
    const logicFunctionId = data.createOneLogicFunction.id;

    logicFunctionIds.push(logicFunctionId);

    return logicFunctionId;
  };

  const findSourceLocation = async (
    logicFunctionId: string,
  ): Promise<{
    sourceHandlerPath: string;
    applicationUniversalIdentifier: string;
  }> => {
    const [location] = await global.testDataSource.query(
      `SELECT "logicFunction"."sourceHandlerPath", application."universalIdentifier" AS "applicationUniversalIdentifier"
       FROM core."logicFunction" "logicFunction"
       JOIN core.application application ON application.id = "logicFunction"."applicationId"
       WHERE "logicFunction".id = $1`,
      [logicFunctionId],
    );

    return location;
  };

  // the oversized source is over the test app's 100kb JSON body limit, so it is written to storage directly
  const createLogicFunctionWithStoredSource = async (
    source: string,
  ): Promise<string> => {
    const logicFunctionId = await createLogicFunction();
    const { sourceHandlerPath, applicationUniversalIdentifier } =
      await findSourceLocation(logicFunctionId);

    await getAppProviderByClassName<FileStorageService>(
      'FileStorageService',
    ).writeFileStream({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
      stream: Readable.from(Buffer.from(source)),
      mimeType: 'text/plain',
    });

    return logicFunctionId;
  };

  const createLogicFunctionWithoutSource = async (): Promise<string> => {
    const logicFunctionId = await createLogicFunction();
    const { sourceHandlerPath, applicationUniversalIdentifier } =
      await findSourceLocation(logicFunctionId);

    await getAppProviderByClassName<FileStorageService>(
      'FileStorageService',
    ).deleteFileObject({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: sourceHandlerPath,
    });

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

    const [step] = await readSteps({
      schema: 'core',
      workflowVersionId: coreWorkflowVersionId,
    });

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
      logicFunctionId: await createLogicFunction(),
    });
    missingFunctionWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with lost code',
      logicFunctionId: randomUUID(),
    });
    oversizedWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with oversized code',
      logicFunctionId:
        await createLogicFunctionWithStoredSource(OVERSIZED_SOURCE),
    });
    nulSourceWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with NUL code',
      logicFunctionId: await createLogicFunctionWithStoredSource(NUL_SOURCE),
    });
    unreadableSourceWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with unreadable code',
      logicFunctionId: await createLogicFunctionWithoutSource(),
    });
    otherApplicationWorkflow = await createLegacyCodeStepWorkflow({
      name: 'Greet with application code',
      logicFunctionId: await createOtherApplicationLogicFunction(),
    });
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

  const expectEveryFunctionKept = async () => {
    for (const logicFunctionId of logicFunctionIds) {
      expect(await logicFunctionExists(logicFunctionId)).toBe(true);
    }
    expect(
      await logicFunctionExists(otherApplicationWorkflow.logicFunctionId),
    ).toBe(true);
  };

  it('changes nothing in a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: legacyWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([legacyWorkflow.step]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: legacyWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([legacyWorkflow.step]);
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: missingFunctionWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([missingFunctionWorkflow.step]);
  });

  it('writes the source of a legacy code step into the step and keeps its logic function', async () => {
    await runCommand();

    const inlinedStep = inlinedStepOf({ step: legacyWorkflow.step });

    expect(inlinedStep.settings.input.logicFunctionId).toBe(
      legacyWorkflow.logicFunctionId,
    );
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: legacyWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([inlinedStep]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: legacyWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([inlinedStep]);
  });

  it('deletes no logic function', async () => {
    await expectEveryFunctionKept();
  });

  it('writes code that throws into a step whose function is gone', async () => {
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: missingFunctionWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([
      inlinedStepOf({
        step: missingFunctionWorkflow.step,
        code: UNRECOVERABLE_CODE_STEP_SOURCE,
      }),
    ]);
  });

  it('leaves a step whose source is over the size limit untouched', async () => {
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: oversizedWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([oversizedWorkflow.step]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: oversizedWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([oversizedWorkflow.step]);
  });

  it('leaves a step whose source contains a NUL character untouched', async () => {
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: nulSourceWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([nulSourceWorkflow.step]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: nulSourceWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([nulSourceWorkflow.step]);
  });

  it('leaves a step whose function exists but whose source cannot be read untouched', async () => {
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: unreadableSourceWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([unreadableSourceWorkflow.step]);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: unreadableSourceWorkflow.workspaceWorkflowVersionId,
      }),
    ).toEqual([unreadableSourceWorkflow.step]);
  });

  it('inlines the source of a function owned by another application', async () => {
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: otherApplicationWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([inlinedStepOf({ step: otherApplicationWorkflow.step })]);
  });

  it('changes nothing on a second run', async () => {
    await runCommand();

    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: legacyWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([inlinedStepOf({ step: legacyWorkflow.step })]);
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: oversizedWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([oversizedWorkflow.step]);
    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: unreadableSourceWorkflow.coreWorkflowVersionId,
      }),
    ).toEqual([unreadableSourceWorkflow.step]);
    await expectEveryFunctionKept();
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

  // the step keeps a logicFunctionId that resolves to nothing, so only the inline code can produce this error
  it('runs the inline code rather than the logic function', async () => {
    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: missingFunctionWorkflow.coreWorkflowVersionId,
    });

    const workflowRunId = await runCoreWorkflowVersion({
      coreWorkflowVersionId: missingFunctionWorkflow.coreWorkflowVersionId,
    });
    const workflowRun = await waitForWorkflowCompletion(workflowRunId);

    expect(workflowRun?.status).toBe('FAILED');
    expect(
      workflowRun?.state?.stepInfos?.[missingFunctionWorkflow.step.id]?.error,
    ).toContain('could not be recovered during the upgrade');
  });
});
