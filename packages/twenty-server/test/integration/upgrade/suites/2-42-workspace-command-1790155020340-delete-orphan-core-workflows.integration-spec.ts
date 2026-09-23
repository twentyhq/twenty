import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { type DeleteOrphanCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790155020340-delete-orphan-core-workflows.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('DeleteOrphanCoreWorkflowsCommand (integration)', () => {
  let dataSource: DataSource;
  let command: DeleteOrphanCoreWorkflowsCommand;
  let customApplicationId: string;
  let otherApplicationId: string;

  const createdWorkspaceWorkflowIds: string[] = [];
  const seededCoreWorkflowIds: string[] = [];

  const createWorkflowWithNullCorePointer = async (
    name: string,
  ): Promise<{ workspaceWorkflowId: string; coreWorkflowId: string }> => {
    const response = await workflowGraphqlRequest(
      `mutation CreateWorkflow($name: String!) {
        createWorkflow(data: { name: $name }) { id }
      }`,
      { name },
    );

    expect(response.body.errors).toBeUndefined();

    const workspaceWorkflowId: string = response.body.data.createWorkflow.id;

    createdWorkspaceWorkflowIds.push(workspaceWorkflowId);

    const [{ coreWorkflowId }] = await dataSource.query(
      `SELECT "coreWorkflowId" FROM "${schema}"."workflow" WHERE "id" = $1`,
      [workspaceWorkflowId],
    );

    seededCoreWorkflowIds.push(coreWorkflowId);

    await dataSource.query(
      `UPDATE core."workflow" SET "workspaceWorkflowId" = NULL WHERE "id" = $1`,
      [coreWorkflowId],
    );

    return { workspaceWorkflowId, coreWorkflowId };
  };

  const createSoftDeletedWorkflow = async (name: string): Promise<string> => {
    const { workspaceWorkflowId, coreWorkflowId } =
      await createWorkflowWithNullCorePointer(name);

    await dataSource.query(
      `UPDATE "${schema}"."workflow" SET "deletedAt" = now() WHERE "id" = $1`,
      [workspaceWorkflowId],
    );

    return coreWorkflowId;
  };

  const seedUnreferencedCoreWorkflow = async (
    applicationId: string,
  ): Promise<string> => {
    const coreWorkflowId = v4();

    await dataSource.query(
      `INSERT INTO core."workflow"
         ("id", "workspaceId", "name", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        coreWorkflowId,
        SEED_APPLE_WORKSPACE_ID,
        'Unreferenced Core Workflow Spec',
        v4(),
        applicationId,
      ],
    );

    seededCoreWorkflowIds.push(coreWorkflowId);

    return coreWorkflowId;
  };

  const doesCoreWorkflowExist = async (
    coreWorkflowId: string,
  ): Promise<boolean> => {
    const rows = await dataSource.query(
      `SELECT 1 FROM core."workflow" WHERE "id" = $1`,
      [coreWorkflowId],
    );

    return rows.length > 0;
  };

  const runCommand = async ({ dryRun }: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
      dataSource,
    });

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });

    await dataSource.initialize();

    command = getAppProviderByClassName<DeleteOrphanCoreWorkflowsCommand>(
      'DeleteOrphanCoreWorkflowsCommand',
    );

    const [workspace] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    customApplicationId = workspace.workspaceCustomApplicationId;

    const [otherApplication] = await dataSource.query(
      `SELECT "id" FROM core."application" WHERE "workspaceId" = $1 AND "id" <> $2 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID, customApplicationId],
    );

    otherApplicationId = otherApplication.id;
  });

  afterAll(async () => {
    for (const workspaceWorkflowId of createdWorkspaceWorkflowIds) {
      await workflowGraphqlRequest(
        `mutation DestroyWorkflow($id: UUID!) {
          destroyWorkflow(id: $id) { id }
        }`,
        { id: workspaceWorkflowId },
      );
    }

    if (seededCoreWorkflowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."workflowVersion" WHERE "coreWorkflowId" = ANY($1::uuid[])`,
        [seededCoreWorkflowIds],
      );
      await dataSource.query(
        `DELETE FROM core."workflow" WHERE "id" = ANY($1::uuid[])`,
        [seededCoreWorkflowIds],
      );
    }

    await dataSource.destroy();
  });

  it('writes nothing on a dry run', async () => {
    const coreWorkflowId = await createSoftDeletedWorkflow(
      'Orphan Core Workflow Dry Run Spec',
    );

    await runCommand({ dryRun: true });

    expect(await doesCoreWorkflowExist(coreWorkflowId)).toBe(true);
  });

  it('deletes custom application core workflows that no live workspace workflow mirrors', async () => {
    const softDeletedCoreWorkflowId = await createSoftDeletedWorkflow(
      'Soft Deleted Workflow Spec',
    );
    const purgedCoreWorkflowId =
      await seedUnreferencedCoreWorkflow(customApplicationId);
    const { coreWorkflowId: liveCoreWorkflowId } =
      await createWorkflowWithNullCorePointer('Live Workflow Spec');
    const otherApplicationCoreWorkflowId =
      await seedUnreferencedCoreWorkflow(otherApplicationId);

    await runCommand();

    expect(await doesCoreWorkflowExist(softDeletedCoreWorkflowId)).toBe(false);
    expect(await doesCoreWorkflowExist(purgedCoreWorkflowId)).toBe(false);
    expect(await doesCoreWorkflowExist(liveCoreWorkflowId)).toBe(true);
    expect(await doesCoreWorkflowExist(otherApplicationCoreWorkflowId)).toBe(
      true,
    );
  });
});
