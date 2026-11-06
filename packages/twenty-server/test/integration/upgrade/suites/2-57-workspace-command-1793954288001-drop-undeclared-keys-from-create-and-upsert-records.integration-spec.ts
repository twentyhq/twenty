import {
  createCoreWorkflow,
  createCoreWorkflowVersionStep,
  deleteCoreWorkflows,
  deleteLegacyWorkspaceWorkflowRecords,
  linkCoreWorkflowToLegacyWorkspaceIds,
  updateCoreWorkflowVersionTrigger,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DropUndeclaredKeysFromCreateAndUpsertRecordsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954288001-drop-undeclared-keys-from-create-and-upsert-records.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type RecordStep = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

const withInput = ({
  step,
  input,
}: {
  step: RecordStep;
  input: Record<string, unknown>;
}): RecordStep => ({
  ...step,
  settings: { ...step.settings, input },
});

describe('2-57 workspace command - drop undeclared keys from create and upsert records (integration)', () => {
  let command: DropUndeclaredKeysFromCreateAndUpsertRecordsCommand;
  let coreWorkflowId: string;
  let coreWorkflowVersionId: string;
  let workspaceWorkflowId: string;
  let workspaceWorkflowVersionId: string;
  let legacySteps: RecordStep[];

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
  }): Promise<RecordStep[]> => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM ${schema}."workflowVersion" WHERE id = $1`,
      [workflowVersionId],
    );

    return steps;
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<DropUndeclaredKeysFromCreateAndUpsertRecordsCommand>(
        'DropUndeclaredKeysFromCreateAndUpsertRecordsCommand',
      );

    ({ coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: 'Record steps with a leftover fieldsToUpdate',
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

    const [upsertRecordStep, createRecordStep, updateRecordStep] = [
      await createCoreWorkflowVersionStep<RecordStep>({
        coreWorkflowVersionId,
        stepType: 'UPSERT_RECORD',
      }),
      await createCoreWorkflowVersionStep<RecordStep>({
        coreWorkflowVersionId,
        stepType: 'CREATE_RECORD',
        position: { x: 400, y: 0 },
      }),
      await createCoreWorkflowVersionStep<RecordStep>({
        coreWorkflowVersionId,
        stepType: 'UPDATE_RECORD',
        position: { x: 800, y: 0 },
      }),
    ];

    legacySteps = [
      withInput({
        step: upsertRecordStep,
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme' },
          fieldsToUpdate: [],
        },
      }),
      withInput({
        step: createRecordStep,
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
          fieldsToUpdate: ['name'],
          outputSchema: {},
        },
      }),
      withInput({
        step: updateRecordStep,
        input: {
          objectName: 'company',
          objectRecordId: '{{trigger.id}}',
          objectRecord: { name: 'Acme' },
          fieldsToUpdate: ['name'],
        },
      }),
    ];

    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb WHERE id = $1`,
      [coreWorkflowVersionId, JSON.stringify(legacySteps)],
    );

    ({
      workspaceWorkflowId,
      workspaceWorkflowVersionIds: [workspaceWorkflowVersionId],
    } = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId,
      withWorkspaceRecords: true,
    }));

    legacySteps = await readSteps({
      schema: 'core',
      workflowVersionId: coreWorkflowVersionId,
    });
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds: [coreWorkflowId] });
    await deleteLegacyWorkspaceWorkflowRecords({ workspaceWorkflowId });
  });

  it('drops undeclared keys from create and upsert record steps only, the same in core and the workspace', async () => {
    await runCommand();

    const [upsertRecordStep, createRecordStep, updateRecordStep] = legacySteps;
    const expectedSteps = [
      withInput({
        step: upsertRecordStep,
        input: { objectName: 'company', objectRecord: { name: 'Acme' } },
      }),
      withInput({
        step: createRecordStep,
        input: {
          objectName: 'company',
          objectRecord: { name: 'Acme', domainName: 'acme.com' },
        },
      }),
      updateRecordStep,
    ];

    expect(
      await readSteps({
        schema: 'core',
        workflowVersionId: coreWorkflowVersionId,
      }),
    ).toEqual(expectedSteps);
    expect(
      await readSteps({
        schema: SCHEMA,
        workflowVersionId: workspaceWorkflowVersionId,
      }),
    ).toEqual(expectedSteps);
  });
});
