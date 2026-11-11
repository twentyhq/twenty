import {
  createCoreWorkflow,
  deleteCoreWorkflows,
} from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddConditionToWorkflowDatabaseEventTriggersCommand } from 'src/database/commands/upgrade-version-command/2-58/2-58-workspace-command-1794409228217-add-condition-to-workflow-database-event-triggers.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildDatabaseEventTrigger = ({
  type,
  operand,
  value,
  path,
}: {
  type: string;
  operand: string;
  value: string;
  path: string;
}) => ({
  name: 'Company is created',
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'company.created',
    outputSchema: {},
    filter: {
      stepFilterGroups: [{ id: 'root', logicalOperator: 'AND' }],
      stepFilters: [
        {
          id: 'filter',
          type,
          operand,
          value,
          stepOutputKey: `{{trigger.properties.after.${path}}}`,
          stepFilterGroupId: 'root',
        },
      ],
    },
  },
  nextStepIds: [],
});

describe('2-58 workspace command - add condition to workflow database event triggers (integration)', () => {
  let command: AddConditionToWorkflowDatabaseEventTriggersCommand;
  const coreWorkflowIds: string[] = [];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const createVersionWithTrigger = async (trigger: object) => {
    const { coreWorkflowId, coreWorkflowVersionId } = await createCoreWorkflow({
      name: '2-58 trigger condition',
    });

    coreWorkflowIds.push(coreWorkflowId);

    await global.testDataSource.query(
      `UPDATE core."workflowVersion" SET triggers = $2::jsonb WHERE id = $1`,
      [coreWorkflowVersionId, JSON.stringify([trigger])],
    );

    return coreWorkflowVersionId;
  };

  const readTriggerSettings = async (coreWorkflowVersionId: string) => {
    const [{ triggers }] = await global.testDataSource.query(
      `SELECT triggers FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    return triggers[0].settings;
  };

  beforeAll(() => {
    command =
      getAppProviderByClassName<AddConditionToWorkflowDatabaseEventTriggersCommand>(
        'AddConditionToWorkflowDatabaseEventTriggersCommand',
      );
  });

  afterAll(async () => {
    await deleteCoreWorkflows({ coreWorkflowIds });
  });

  it('adds the exact condition, keeps the filter, and leaves the rest alone', async () => {
    const convertibleVersionId = await createVersionWithTrigger(
      buildDatabaseEventTrigger({
        type: 'TEXT',
        operand: 'IS',
        value: 'Acme',
        path: 'name',
      }),
    );
    const legacyVersionId = await createVersionWithTrigger(
      buildDatabaseEventTrigger({
        type: 'BOOLEAN',
        operand: 'IS',
        value: 'false',
        path: 'name',
      }),
    );
    const unknownFieldVersionId = await createVersionWithTrigger(
      buildDatabaseEventTrigger({
        type: 'TEXT',
        operand: 'IS',
        value: 'Acme',
        path: 'notAField',
      }),
    );

    await runCommand({ dryRun: true });
    expect(
      (await readTriggerSettings(convertibleVersionId)).condition,
    ).toBeUndefined();

    await runCommand();

    const convertibleSettings = await readTriggerSettings(convertibleVersionId);

    expect(convertibleSettings.condition).toBe("name == 'Acme'");
    expect(convertibleSettings.filter.stepFilters).toHaveLength(1);
    expect(
      (await readTriggerSettings(legacyVersionId)).condition,
    ).toBeUndefined();
    expect(
      (await readTriggerSettings(unknownFieldVersionId)).condition,
    ).toBeUndefined();

    await runCommand();
    expect((await readTriggerSettings(convertibleVersionId)).condition).toBe(
      "name == 'Acme'",
    );
  });
});
