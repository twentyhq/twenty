import { workflowGraphqlRequest } from 'test/integration/graphql/suites/workflow/utils/workflow-graphql-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { type DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790155020340-delete-core-workflows-of-soft-deleted-workflows.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const schema = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand (integration)', () => {
  let dataSource: DataSource;
  let command: DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand;
  let applicationId: string;

  const createdWorkspaceWorkflowIds: string[] = [];
  const seededCoreWorkflowIds: string[] = [];

  const createWorkflow = async (
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

    return { workspaceWorkflowId, coreWorkflowId };
  };

  const createSoftDeletedWorkflowWithCoreRow = async (
    name: string,
  ): Promise<string> => {
    const { workspaceWorkflowId, coreWorkflowId } = await createWorkflow(name);

    await dataSource.query(
      `UPDATE "${schema}"."workflow" SET "deletedAt" = now() WHERE "id" = $1`,
      [workspaceWorkflowId],
    );
    await dataSource.query(
      `UPDATE core."workflow" SET "workspaceWorkflowId" = NULL WHERE "id" = $1`,
      [coreWorkflowId],
    );

    return coreWorkflowId;
  };

  const seedCoreOnlyWorkflow = async (): Promise<string> => {
    const coreWorkflowId = v4();

    await dataSource.query(
      `INSERT INTO core."workflow"
         ("id", "workspaceId", "name", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        coreWorkflowId,
        SEED_APPLE_WORKSPACE_ID,
        'Core Only Workflow Spec',
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

    command =
      getAppProviderByClassName<DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand>(
        'DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand',
      );

    const [workspace] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    applicationId = workspace.workspaceCustomApplicationId;
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
    const coreWorkflowId = await createSoftDeletedWorkflowWithCoreRow(
      'Soft Deleted Workflow Dry Run Spec',
    );

    await runCommand({ dryRun: true });

    expect(await doesCoreWorkflowExist(coreWorkflowId)).toBe(true);
  });

  it('deletes only the core workflows whose workspace workflow is soft-deleted', async () => {
    const softDeletedCoreWorkflowId =
      await createSoftDeletedWorkflowWithCoreRow('Soft Deleted Workflow Spec');
    const { coreWorkflowId: liveCoreWorkflowId } =
      await createWorkflow('Live Workflow Spec');
    const coreOnlyWorkflowId = await seedCoreOnlyWorkflow();

    await runCommand();

    expect(await doesCoreWorkflowExist(softDeletedCoreWorkflowId)).toBe(false);
    expect(await doesCoreWorkflowExist(liveCoreWorkflowId)).toBe(true);
    expect(await doesCoreWorkflowExist(coreOnlyWorkflowId)).toBe(true);
  });
});
