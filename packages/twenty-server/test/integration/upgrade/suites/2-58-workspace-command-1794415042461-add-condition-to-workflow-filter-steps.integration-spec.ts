import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddConditionToWorkflowFilterStepsCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794415042461-add-condition-to-workflow-filter-steps.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const STEP_SETTINGS = {
  outputSchema: {},
  errorHandlingOptions: {
    retryOnFailure: { value: 0 },
    continueOnFailure: { value: false },
  },
};

const buildStepFilter = ({
  id,
  groupId,
  type,
  value,
}: {
  id: string;
  groupId: string;
  type: string;
  value: string;
}) => ({
  id,
  type,
  operand: 'IS',
  value,
  stepOutputKey: '{{trigger.name}}',
  stepFilterGroupId: groupId,
});

const FILTER_STEP = {
  id: 'filter-step',
  name: 'Filter',
  type: 'FILTER',
  valid: true,
  nextStepIds: [],
  settings: {
    ...STEP_SETTINGS,
    input: {
      stepFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
      stepFilters: [
        buildStepFilter({
          id: 'name',
          groupId: 'root',
          type: 'TEXT',
          value: 'Acme',
        }),
      ],
    },
  },
};

const IF_ELSE_STEP = {
  id: 'if-else-step',
  name: 'If/Else',
  type: 'IF_ELSE',
  valid: true,
  nextStepIds: [],
  settings: {
    ...STEP_SETTINGS,
    input: {
      stepFilterGroups: [
        { id: 'if', logicalOperator: 'AND' },
        { id: 'else-if', logicalOperator: 'AND' },
      ],
      stepFilters: [
        buildStepFilter({
          id: 'if-name',
          groupId: 'if',
          type: 'TEXT',
          value: 'Acme',
        }),
        buildStepFilter({
          id: 'else-if-payload',
          groupId: 'else-if',
          type: 'RAW_JSON',
          value: '{}',
        }),
      ],
      branches: [
        { id: 'if-branch', filterGroupId: 'if', nextStepIds: [] },
        { id: 'else-if-branch', filterGroupId: 'else-if', nextStepIds: [] },
        { id: 'else-branch', nextStepIds: [] },
      ],
    },
  },
};

describe('2-58 workspace command - add condition to workflow filter steps (integration)', () => {
  let command: AddConditionToWorkflowFilterStepsCommand;
  const coreWorkflowIds: string[] = [];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const readSteps = async (coreWorkflowVersionId: string) => {
    const [{ steps }] = await global.testDataSource.query(
      `SELECT steps FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    return steps;
  };

  beforeAll(() => {
    command =
      getAppProviderByClassName<AddConditionToWorkflowFilterStepsCommand>(
        'AddConditionToWorkflowFilterStepsCommand',
      );
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds });
  });

  it('adds the exact conditions, keeps the filters, and leaves the rest alone', async () => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: '2-58 step condition',
    });

    coreWorkflowIds.push(coreWorkflowId);
    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET steps = $2::jsonb WHERE id = $1`,
      [coreWorkflowVersionId, JSON.stringify([FILTER_STEP, IF_ELSE_STEP])],
    );

    await runCommand({ dryRun: true });
    expect(
      (await readSteps(coreWorkflowVersionId))[0].settings.input.condition,
    ).toBeUndefined();

    await runCommand();

    const [filterStep, ifElseStep] = await readSteps(coreWorkflowVersionId);

    expect(filterStep.settings.input).toMatchObject({
      condition: "{{trigger.name}} == 'Acme'",
      stepFilters: FILTER_STEP.settings.input.stepFilters,
    });
    expect(ifElseStep.settings.input.branches).toEqual([
      {
        id: 'if-branch',
        filterGroupId: 'if',
        nextStepIds: [],
        condition: "{{trigger.name}} == 'Acme'",
      },
      { id: 'else-if-branch', filterGroupId: 'else-if', nextStepIds: [] },
      { id: 'else-branch', nextStepIds: [] },
    ]);
    expect(ifElseStep.settings.input.stepFilters).toHaveLength(2);

    await runCommand();
    expect(await readSteps(coreWorkflowVersionId)).toEqual([
      filterStep,
      ifElseStep,
    ]);
  });
});
