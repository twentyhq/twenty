import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { type RelinkWorkflowVersionsToCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789566000000-relink-workflow-versions-to-core-workflows.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('RelinkWorkflowVersionsToCoreWorkflowsCommand (integration)', () => {
  let dataSource: DataSource;
  let command: RelinkWorkflowVersionsToCoreWorkflowsCommand;
  let applicationId: string;

  const seededCoreWorkflowIds: string[] = [];
  const seededCoreVersionIds: string[] = [];

  const seedCoreWorkflow = async (
    workspaceWorkflowId: string,
    createdAt?: string,
  ): Promise<string> => {
    const coreWorkflowId = v4();

    await dataSource.query(
      `INSERT INTO core."workflow"
         ("id", "workspaceId", "name", "workspaceWorkflowId", "universalIdentifier", "applicationId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, coalesce($7::timestamptz, now()))`,
      [
        coreWorkflowId,
        SEED_APPLE_WORKSPACE_ID,
        'Relink Command Spec',
        workspaceWorkflowId,
        v4(),
        applicationId,
        createdAt ?? null,
      ],
    );

    seededCoreWorkflowIds.push(coreWorkflowId);

    return coreWorkflowId;
  };

  const seedUnlinkedCoreVersion = async (
    workspaceWorkflowId: string,
  ): Promise<string> => {
    const coreVersionId = v4();

    await dataSource.query(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "coreWorkflowId", "status", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, NULL, 'DRAFT', $4, $5)`,
      [
        coreVersionId,
        SEED_APPLE_WORKSPACE_ID,
        workspaceWorkflowId,
        v4(),
        applicationId,
      ],
    );

    seededCoreVersionIds.push(coreVersionId);

    return coreVersionId;
  };

  const readCoreWorkflowIdOfVersion = async (
    coreVersionId: string,
  ): Promise<string | null> => {
    const [row] = await dataSource.query(
      `SELECT "coreWorkflowId" FROM core."workflowVersion" WHERE "id" = $1`,
      [coreVersionId],
    );

    return row?.coreWorkflowId ?? null;
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
      getAppProviderByClassName<RelinkWorkflowVersionsToCoreWorkflowsCommand>(
        'RelinkWorkflowVersionsToCoreWorkflowsCommand',
      );

    const [workspace] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    applicationId = workspace.workspaceCustomApplicationId;
  });

  afterAll(async () => {
    if (seededCoreVersionIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."workflowVersion" WHERE "id" = ANY($1::uuid[])`,
        [seededCoreVersionIds],
      );
    }

    if (seededCoreWorkflowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."workflow" WHERE "id" = ANY($1::uuid[])`,
        [seededCoreWorkflowIds],
      );
    }

    await dataSource.destroy();
  });

  it('relinks an unlinked version to the core workflow mirroring its workspace workflow', async () => {
    const workspaceWorkflowId = v4();
    const coreWorkflowId = await seedCoreWorkflow(workspaceWorkflowId);
    const coreVersionId = await seedUnlinkedCoreVersion(workspaceWorkflowId);

    expect(await readCoreWorkflowIdOfVersion(coreVersionId)).toBeNull();

    await runCommand();

    expect(await readCoreWorkflowIdOfVersion(coreVersionId)).toBe(
      coreWorkflowId,
    );
  });

  it('leaves a version whose workspace workflow has no core mirror untouched', async () => {
    const coreVersionId = await seedUnlinkedCoreVersion(v4());

    await runCommand();

    expect(await readCoreWorkflowIdOfVersion(coreVersionId)).toBeNull();
  });

  it('links to the oldest core workflow when several mirror the same workspace workflow and no pointer resolves', async () => {
    const workspaceWorkflowId = v4();

    const oldestCoreWorkflowId = await seedCoreWorkflow(
      workspaceWorkflowId,
      '2020-01-01T00:00:00.000Z',
    );

    await seedCoreWorkflow(workspaceWorkflowId, '2021-01-01T00:00:00.000Z');

    const coreVersionId = await seedUnlinkedCoreVersion(workspaceWorkflowId);

    await runCommand();

    expect(await readCoreWorkflowIdOfVersion(coreVersionId)).toBe(
      oldestCoreWorkflowId,
    );
  });

  it('writes nothing on a dry run', async () => {
    const workspaceWorkflowId = v4();

    await seedCoreWorkflow(workspaceWorkflowId);

    const coreVersionId = await seedUnlinkedCoreVersion(workspaceWorkflowId);

    await runCommand({ dryRun: true });

    expect(await readCoreWorkflowIdOfVersion(coreVersionId)).toBeNull();
  });
});
