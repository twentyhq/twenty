import { randomUUID } from 'crypto';

import { createCoreWorkflow } from 'test/integration/graphql/suites/workflow/utils/core-workflow.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type DeleteOrphanCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790155020340-delete-orphan-core-workflows.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const renameDeferredOperationColumn = ({
  from,
  to,
}: {
  from: string;
  to: string;
}) =>
  global.testDataSource.query(
    `ALTER TABLE core."deferredWorkspaceOperation" RENAME COLUMN "${from}" TO "${to}"`,
  );

describe('2-42 workspace command 1790155020340 - DeleteOrphanCoreWorkflowsCommand (integration)', () => {
  let command: DeleteOrphanCoreWorkflowsCommand;
  let coreWorkflowId: string;
  let isDeferredOperationColumnRenamed = false;
  const workflowRunId = randomUUID();

  beforeAll(async () => {
    command = getAppProviderByClassName<DeleteOrphanCoreWorkflowsCommand>(
      'DeleteOrphanCoreWorkflowsCommand',
    );

    ({ coreWorkflowId } = await createCoreWorkflow({
      name: 'Orphan core workflow',
    }));

    // recreate the 2.42 state: a soft-deleted workspace mirror and the pre-2.43 deferred column name
    await global.testDataSource.query(
      `CREATE TABLE ${SCHEMA}."workflow" (id uuid PRIMARY KEY, "coreWorkflowId" uuid, "deletedAt" timestamptz)`,
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflow" (id, "coreWorkflowId", "deletedAt") VALUES ($1, $2, now())`,
      [randomUUID(), coreWorkflowId],
    );
    await global.testDataSource.query(
      `INSERT INTO ${SCHEMA}."workflowRun" (id, name, "coreWorkflowId", "coreWorkflowVersionId", status, position, state) VALUES ($1, 'Orphan run', $2, $3, 'COMPLETED', 0, '{}')`,
      [workflowRunId, coreWorkflowId, randomUUID()],
    );
    await renameDeferredOperationColumn({
      from: 'name',
      to: 'actionHandlerKey',
    });
    isDeferredOperationColumnRenamed = true;
  });

  afterAll(async () => {
    if (isDeferredOperationColumnRenamed) {
      await renameDeferredOperationColumn({
        from: 'actionHandlerKey',
        to: 'name',
      });
    }

    await global.testDataSource.query(
      `DROP TABLE IF EXISTS ${SCHEMA}."workflow"`,
    );
    await global.testDataSource.query(
      `DELETE FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
      [workflowRunId],
    );
    await global.testDataSource.query(
      `DELETE FROM core."workflow" WHERE id = $1`,
      [coreWorkflowId],
    );
  });

  it('deletes the orphan core workflow and its runs without touching the deferred operations table', async () => {
    await command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

    expect(
      await global.testDataSource.query(
        `SELECT id FROM core."workflow" WHERE id = $1`,
        [coreWorkflowId],
      ),
    ).toEqual([]);
    expect(
      await global.testDataSource.query(
        `SELECT id FROM ${SCHEMA}."workflowRun" WHERE id = $1`,
        [workflowRunId],
      ),
    ).toEqual([]);
  });
});
