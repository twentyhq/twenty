import { DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { EnforceWorkflowVersionCoreParentSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-instance-command-slow-1790165119047-enforce-workflow-version-core-parent';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('EnforceWorkflowVersionCoreParentSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let command: EnforceWorkflowVersionCoreParentSlowInstanceCommand;
  let applicationId: string;

  const workspaceCacheService = { flush: jest.fn() };

  const seedCoreWorkflow = async (
    workspaceWorkflowId: string,
  ): Promise<string> => {
    const coreWorkflowId = v4();

    await dataSource.query(
      `INSERT INTO core."workflow"
         ("id", "workspaceId", "name", "workspaceWorkflowId", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        coreWorkflowId,
        SEED_APPLE_WORKSPACE_ID,
        'Enforce Core Parent Spec',
        workspaceWorkflowId,
        v4(),
        applicationId,
      ],
    );

    return coreWorkflowId;
  };

  const seedCoreVersion = async ({
    workflowId,
    coreWorkflowId,
    status = 'DRAFT',
  }: {
    workflowId: string | null;
    coreWorkflowId: string | null;
    status?: 'DRAFT' | 'ACTIVE';
  }): Promise<string> => {
    const coreVersionId = v4();

    await dataSource.query(
      `INSERT INTO core."workflowVersion"
         ("id", "workspaceId", "workflowId", "coreWorkflowId", "status", "universalIdentifier", "applicationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        coreVersionId,
        SEED_APPLE_WORKSPACE_ID,
        workflowId,
        coreWorkflowId,
        status,
        v4(),
        applicationId,
      ],
    );

    return coreVersionId;
  };

  const findCoreVersion = async (
    coreVersionId: string,
  ): Promise<{ coreWorkflowId: string | null } | undefined> => {
    const [row] = await dataSource.query(
      `SELECT "coreWorkflowId" FROM core."workflowVersion" WHERE "id" = $1`,
      [coreVersionId],
    );

    return row;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    command = new EnforceWorkflowVersionCoreParentSlowInstanceCommand(
      workspaceCacheService as unknown as WorkspaceCacheService,
    );

    const [workspace] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE "id" = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    applicationId = workspace.workspaceCustomApplicationId;
  }, 30000);

  beforeEach(async () => {
    workspaceCacheService.flush.mockReset().mockResolvedValue(undefined);

    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    jest
      .spyOn(dataSource, 'query')
      .mockImplementation((query, parameters) =>
        queryRunner.query(query, parameters),
      );

    await command.down(queryRunner);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('deletes a version without a core workflow', async () => {
    const coreVersionId = await seedCoreVersion({
      workflowId: v4(),
      coreWorkflowId: null,
    });

    await command.runDataMigration(dataSource);

    expect(await findCoreVersion(coreVersionId)).toBeUndefined();
  });

  it('keeps a linked version', async () => {
    const workspaceWorkflowId = v4();
    const coreWorkflowId = await seedCoreWorkflow(workspaceWorkflowId);

    const coreVersionId = await seedCoreVersion({
      workflowId: workspaceWorkflowId,
      coreWorkflowId,
    });

    await command.runDataMigration(dataSource);

    expect(await findCoreVersion(coreVersionId)).toEqual({ coreWorkflowId });
  });

  it('flushes the workflow version and trigger caches of a cleaned workspace', async () => {
    await seedCoreVersion({ workflowId: v4(), coreWorkflowId: null });

    await command.runDataMigration(dataSource);

    expect(workspaceCacheService.flush).toHaveBeenCalledWith(
      SEED_APPLE_WORKSPACE_ID,
      ['flatWorkflowVersionMaps', 'workflowAutomatedTriggerMaps'],
    );
  });

  it('rejects a version without a core workflow once applied', async () => {
    await command.runDataMigration(dataSource);
    await command.up(queryRunner);

    await expect(
      seedCoreVersion({ workflowId: v4(), coreWorkflowId: null }),
    ).rejects.toThrow(/coreWorkflowId/);
  });

  it('rejects a second active version of the same core workflow once applied', async () => {
    const coreWorkflowId = await seedCoreWorkflow(v4());

    await command.runDataMigration(dataSource);
    await command.up(queryRunner);

    await seedCoreVersion({
      workflowId: null,
      coreWorkflowId,
      status: 'ACTIVE',
    });

    await expect(
      seedCoreVersion({ workflowId: null, coreWorkflowId, status: 'ACTIVE' }),
    ).rejects.toThrow(/IDX_WORKFLOW_VERSION_ONE_ACTIVE_PER_WORKFLOW/);
  });
});
