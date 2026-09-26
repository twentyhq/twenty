import { Test, type TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkflowExecutionCoreIdsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1789719131001-backfill-workflow-execution-core-ids.command';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schema = getWorkspaceSchemaName(workspaceId);

describe('workflow execution backfill repair (integration)', () => {
  let dataSource: DataSource;
  let testingModule: TestingModule;
  let command: BackfillWorkflowExecutionCoreIdsCommand;
  let applicationId: string;
  const workflowIds: string[] = [];
  const coreVersionIds: string[] = [];
  const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);

  const runCommand = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId,
      options: { dryRun },
      dataSource,
      index: 0,
      total: 1,
    });

  const seedEmptyWorkflow = async (deleted = false) => {
    const workflowId = randomUUID();

    workflowIds.push(workflowId);
    await dataSource.query(
      `INSERT INTO "${schema}".workflow (id, name, "deletedAt")
       VALUES ($1, 'Workflow backfill repair fixture', $2)`,
      [workflowId, deleted ? new Date('2026-01-01') : null],
    );

    return workflowId;
  };

  const seedDeletedWorkflowWithOrphanVersion = async () => {
    const workflowId = await seedEmptyWorkflow(true);
    const workflowVersionId = randomUUID();
    const coreVersionId = randomUUID();
    const missingCoreWorkflowId = randomUUID();

    coreVersionIds.push(coreVersionId);
    await dataSource.query(
      `INSERT INTO core."workflowVersion"
         (id, "workspaceId", "applicationId", "universalIdentifier", "coreWorkflowId", "workflowId", status)
       VALUES ($1, $2, $3, $1, $4, $5, 'ACTIVE')`,
      [
        coreVersionId,
        workspaceId,
        applicationId,
        missingCoreWorkflowId,
        workflowId,
      ],
    );
    await dataSource.query(
      `INSERT INTO "${schema}"."workflowVersion"
         (id, "workflowId", "coreWorkflowVersionId", status, "deletedAt")
       VALUES ($1, $2, $3, 'ACTIVE', '2026-01-01')`,
      [workflowVersionId, workflowId, coreVersionId],
    );

    for (const status of ['NOT_STARTED', 'COMPLETED', 'FAILED']) {
      await dataSource.query(
        `INSERT INTO "${schema}"."workflowRun"
           (id, "workflowId", "workflowVersionId", "coreWorkflowId", "coreWorkflowVersionId", status, state, "deletedAt")
         VALUES ($1, $2, $3, $4, $5, $6, '{"marker":"preserve historical run"}', '2026-01-01')`,
        [
          randomUUID(),
          workflowId,
          workflowVersionId,
          missingCoreWorkflowId,
          coreVersionId,
          status,
        ],
      );
    }

    return { workflowId, workflowVersionId, coreVersionId };
  };

  const readRuns = (workflowId: string) =>
    dataSource.query(
      `SELECT * FROM "${schema}"."workflowRun" WHERE "workflowId" = $1 ORDER BY id`,
      [workflowId],
    );

  const readCoreVersion = (coreVersionId: string) =>
    dataSource.query('SELECT * FROM core."workflowVersion" WHERE id = $1', [
      coreVersionId,
    ]);

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();
    const [workspace] = await dataSource.query(
      'SELECT "workspaceCustomApplicationId" FROM core.workspace WHERE id = $1',
      [workspaceId],
    );

    applicationId = workspace.workspaceCustomApplicationId;
    testingModule = await Test.createTestingModule({
      providers: [
        BackfillWorkflowExecutionCoreIdsCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute },
        },
      ],
    }).compile();
    command = testingModule.get(BackfillWorkflowExecutionCoreIdsCommand);
  });

  afterEach(async () => {
    await dataSource.query(
      `DELETE FROM "${schema}"."workflowRun" WHERE "workflowId" = ANY($1::uuid[])`,
      [workflowIds],
    );
    await dataSource.query(
      `DELETE FROM "${schema}"."workflowVersion" WHERE "workflowId" = ANY($1::uuid[])`,
      [workflowIds],
    );
    await dataSource.query(
      'DELETE FROM core."workflowVersion" WHERE id = ANY($1::uuid[])',
      [coreVersionIds],
    );
    await dataSource.query(
      'DELETE FROM core.workflow WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = ANY($2::uuid[])',
      [workspaceId, workflowIds],
    );
    await dataSource.query(
      `DELETE FROM "${schema}".workflow WHERE id = ANY($1::uuid[])`,
      [workflowIds],
    );
    workflowIds.length = 0;
    coreVersionIds.length = 0;
    invalidateAndRecompute.mockClear();
  });

  afterAll(async () => {
    await testingModule?.close();
    await dataSource?.destroy();
  });

  it('removes a deleted version with a dangling core parent without changing deleted runs or resurrecting its workflow', async () => {
    const { workflowId, coreVersionId } =
      await seedDeletedWorkflowWithOrphanVersion();
    const runsBefore = await readRuns(workflowId);

    await runCommand();
    await runCommand();

    expect(await readCoreVersion(coreVersionId)).toEqual([]);
    expect(await readRuns(workflowId)).toEqual(runsBefore);
    expect(
      await dataSource.query(
        'SELECT id FROM core.workflow WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = $2',
        [workspaceId, workflowId],
      ),
    ).toEqual([]);
    const [projection] = await dataSource.query(
      `SELECT "deletedAt" FROM "${schema}".workflow WHERE id = $1`,
      [workflowId],
    );

    expect(projection.deletedAt).not.toBeNull();
    expect(invalidateAndRecompute).toHaveBeenCalledWith(workspaceId, [
      'flatWorkflowMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);
  });

  it('rolls back orphan cleanup on a dry run and does not refresh caches', async () => {
    const { workflowId, coreVersionId } =
      await seedDeletedWorkflowWithOrphanVersion();
    const versionBefore = await readCoreVersion(coreVersionId);
    const runsBefore = await readRuns(workflowId);

    await runCommand(true);

    expect(await readCoreVersion(coreVersionId)).toEqual(versionBefore);
    expect(await readRuns(workflowId)).toEqual(runsBefore);
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('preserves and rejects an orphan still referenced by a live version, rolling back other repairs', async () => {
    const { workflowVersionId, coreVersionId } =
      await seedDeletedWorkflowWithOrphanVersion();
    const emptyWorkflowId = await seedEmptyWorkflow();

    await dataSource.query(
      `UPDATE "${schema}"."workflowVersion" SET "deletedAt" = NULL WHERE id = $1`,
      [workflowVersionId],
    );
    const versionBefore = await readCoreVersion(coreVersionId);

    await expect(runCommand()).rejects.toThrow(
      'Missing or conflicting workflow version mapping',
    );

    expect(await readCoreVersion(coreVersionId)).toEqual(versionBefore);
    const [projection] = await dataSource.query(
      `SELECT "coreWorkflowId" FROM "${schema}".workflow WHERE id = $1`,
      [emptyWorkflowId],
    );

    expect(projection.coreWorkflowId).toBeNull();
    expect(
      await dataSource.query(
        'SELECT id FROM core.workflow WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = $2',
        [workspaceId, emptyWorkflowId],
      ),
    ).toEqual([]);
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('repairs a live empty workflow once without publishing it or creating versions or runs', async () => {
    const workflowId = await seedEmptyWorkflow();

    await runCommand(true);
    const [dryRunProjection] = await dataSource.query(
      `SELECT "coreWorkflowId" FROM "${schema}".workflow WHERE id = $1`,
      [workflowId],
    );

    expect(dryRunProjection.coreWorkflowId).toBeNull();
    await runCommand();
    const readMapping = () =>
      dataSource.query(
        `SELECT w."coreWorkflowId", c.id, c."workspaceWorkflowId", c."lastPublishedVersionId", c."lastPublishedCoreWorkflowVersionId"
       FROM "${schema}".workflow w JOIN core.workflow c ON c.id = w."coreWorkflowId" AND c."workspaceId" = $1 WHERE w.id = $2`,
        [workspaceId, workflowId],
      );
    const mapping = await readMapping();

    expect(mapping).toEqual([
      {
        coreWorkflowId: expect.any(String),
        id: expect.any(String),
        workspaceWorkflowId: workflowId,
        lastPublishedVersionId: null,
        lastPublishedCoreWorkflowVersionId: null,
      },
    ]);
    expect(mapping[0].coreWorkflowId).toBe(mapping[0].id);
    await runCommand();
    expect(await readMapping()).toEqual(mapping);
    expect(
      await dataSource.query(
        `SELECT id FROM "${schema}"."workflowVersion" WHERE "workflowId" = $1`,
        [workflowId],
      ),
    ).toEqual([]);
    expect(await readRuns(workflowId)).toEqual([]);
  });
});
