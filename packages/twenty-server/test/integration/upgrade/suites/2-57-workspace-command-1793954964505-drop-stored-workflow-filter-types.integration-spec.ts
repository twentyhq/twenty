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
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DropStoredWorkflowFilterTypesCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793954964505-drop-stored-workflow-filter-types.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const STEP_FILTER_GROUP_ID = 'b2c3d4e5-1111-4a2b-8c3d-000000000001';

type StoredNode = {
  id: string;
  type: string;
  settings: { input: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

const STORED_STEP_FILTER = {
  id: 'b2c3d4e5-2222-4a2b-8c3d-000000000002',
  operand: 'CONTAINS',
  value: 'Acme',
  stepOutputKey: '{{trigger.properties.after.name}}',
  stepFilterGroupId: STEP_FILTER_GROUP_ID,
};

const FILTER_SETTINGS = {
  stepFilterGroups: [{ id: STEP_FILTER_GROUP_ID, logicalOperator: 'AND' }],
  stepFilters: [{ ...STORED_STEP_FILTER, type: 'TEXT' }],
};

const COMPANY_CREATED_TRIGGER = {
  name: 'Company is created',
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'company.created',
    outputSchema: {},
    filter: FILTER_SETTINGS,
  },
  nextStepIds: [],
  position: { x: 0, y: 0 },
};

const withFilterSettings = (step: StoredNode): StoredNode => ({
  ...step,
  settings: { ...step.settings, input: FILTER_SETTINGS },
});

describe('2-57 workspace command - drop stored workflow filter types (integration)', () => {
  let command: DropStoredWorkflowFilterTypesCommand;
  let coreWorkflowVersionId: string;
  let workspaceWorkflowVersionId: string;
  let storedFilterStep: StoredNode;
  const coreWorkflowIds: string[] = [];
  const workspaceWorkflowIds: string[] = [];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readVersion = async ({
    schema,
    workflowVersionId,
  }: {
    schema: string;
    workflowVersionId: string;
  }): Promise<{
    steps: StoredNode[];
    trigger: { settings: Record<string, unknown> };
  }> => {
    const [row] = await global.testDataSource.query(
      schema === 'core'
        ? `SELECT steps, triggers->0 AS trigger FROM core."workflowVersion" WHERE id = $1`
        : `SELECT steps, trigger FROM ${schema}."workflowVersion" WHERE id = $1`,
      [workflowVersionId],
    );

    return row;
  };

  const readRun = async (workflowRunId: string) => {
    const [run] = await global.testDataSource.query(
      `SELECT status, state FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
      [workflowRunId],
    );

    return run;
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<DropStoredWorkflowFilterTypesCommand>(
      'DropStoredWorkflowFilterTypesCommand',
    );

    const createdCoreWorkflow = await createCoreWorkflow({
      name: 'Filter companies named Acme',
    });

    coreWorkflowVersionId = createdCoreWorkflow.coreWorkflowVersionId;
    coreWorkflowIds.push(createdCoreWorkflow.coreWorkflowId);

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId,
      trigger: COMPANY_CREATED_TRIGGER,
    });

    const createdStep = await createCoreWorkflowVersionStep<StoredNode>({
      coreWorkflowVersionId,
      stepType: 'FILTER',
    });

    storedFilterStep = withFilterSettings(createdStep);

    // the builder no longer writes the type, so the stored shape is written directly
    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb, triggers = $3::jsonb WHERE id = $1`,
      [
        coreWorkflowVersionId,
        JSON.stringify([storedFilterStep]),
        JSON.stringify([COMPANY_CREATED_TRIGGER]),
      ],
    );

    const {
      workspaceWorkflowId,
      workspaceWorkflowVersionIds: [linkedWorkspaceWorkflowVersionId],
    } = await linkCoreWorkflowToLegacyWorkspaceIds({
      coreWorkflowId: createdCoreWorkflow.coreWorkflowId,
      withWorkspaceRecords: true,
    });

    workspaceWorkflowVersionId = linkedWorkspaceWorkflowVersionId;
    workspaceWorkflowIds.push(workspaceWorkflowId);
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
  });

  it('changes nothing in a dry run', async () => {
    const coreVersionBefore = await readVersion({
      schema: 'core',
      workflowVersionId: coreWorkflowVersionId,
    });

    await runCommand({ dryRun: true });

    expect(
      await readVersion({
        schema: 'core',
        workflowVersionId: coreWorkflowVersionId,
      }),
    ).toEqual(coreVersionBefore);
    expect(coreVersionBefore.steps[0].settings).toHaveProperty(
      'input.stepFilters.0.type',
      'TEXT',
    );
  });

  it('drops the stored type from steps and trigger filters, the same in core and the workspace', async () => {
    await runCommand();

    const coreVersion = await readVersion({
      schema: 'core',
      workflowVersionId: coreWorkflowVersionId,
    });

    expect(coreVersion.steps[0].settings).toHaveProperty('input.stepFilters', [
      STORED_STEP_FILTER,
    ]);
    expect(coreVersion.trigger.settings).toHaveProperty('filter.stepFilters', [
      STORED_STEP_FILTER,
    ]);

    const workspaceVersion = await readVersion({
      schema: SCHEMA,
      workflowVersionId: workspaceWorkflowVersionId,
    });

    expect(workspaceVersion.steps).toEqual(coreVersion.steps);
    expect(workspaceVersion.trigger.settings).toHaveProperty(
      'filter.stepFilters',
      [STORED_STEP_FILTER],
    );
  });

  it('drops the type from the steps of runs still executing and leaves ended runs as they ran', async () => {
    const runnableWorkflow = await createCoreWorkflow({
      name: 'Run before the filter types are dropped',
    });
    const runnableVersionId = runnableWorkflow.coreWorkflowVersionId;

    coreWorkflowIds.push(runnableWorkflow.coreWorkflowId);

    await updateCoreWorkflowVersionTrigger({
      coreWorkflowVersionId: runnableVersionId,
      trigger: {
        name: 'Manual Trigger',
        type: 'MANUAL',
        settings: { outputSchema: {} },
        nextStepIds: [],
        position: { x: 0, y: 0 },
      },
    });
    await createCoreWorkflowVersionStep({
      coreWorkflowVersionId: runnableVersionId,
      stepType: 'CODE',
    });
    await activateCoreWorkflowVersion({
      coreWorkflowVersionId: runnableVersionId,
    });

    const [pendingRunId, endedRunId] = [
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: runnableVersionId,
      }),
      await runCoreWorkflowVersion({
        coreWorkflowVersionId: runnableVersionId,
      }),
    ];

    await waitForWorkflowCompletion(pendingRunId);
    await waitForWorkflowCompletion(endedRunId);

    const legacySteps = JSON.stringify([storedFilterStep]);

    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET status = 'NOT_STARTED', state = jsonb_set(state, '{flow,steps}', $2::jsonb) WHERE id = $1`,
      [pendingRunId, legacySteps],
    );
    await global.testDataSource.query(
      `UPDATE ${SCHEMA}."workflowRun" SET state = jsonb_set(state, '{flow,steps}', $2::jsonb) WHERE id = $1`,
      [endedRunId, legacySteps],
    );

    const pendingRunBefore = await readRun(pendingRunId);
    const endedRunBefore = await readRun(endedRunId);

    await runCommand();

    const pendingRunAfter = await readRun(pendingRunId);

    expect(pendingRunAfter.state.flow.steps[0].settings).toHaveProperty(
      'input.stepFilters',
      [STORED_STEP_FILTER],
    );
    expect(pendingRunAfter.state.stepInfos).toEqual(
      pendingRunBefore.state.stepInfos,
    );
    expect(await readRun(endedRunId)).toEqual(endedRunBefore);
  });
});
