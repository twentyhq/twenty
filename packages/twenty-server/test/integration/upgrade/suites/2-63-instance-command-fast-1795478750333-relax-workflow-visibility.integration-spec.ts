import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { RelaxWorkflowVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-instance-command-fast-1795478750333-relax-workflow-visibility';
import { DropWorkflowVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-instance-command-fast-1795439685598-drop-workflow-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-63 instance command 1795478750333 - relax workflow visibility (integration)', () => {
  const relaxVisibilityCommand =
    new RelaxWorkflowVisibilityFastInstanceCommand();
  const dropVisibilityCommand = new DropWorkflowVisibilityFastInstanceCommand();
  let queryRunner: QueryRunner;

  const insertWorkflow = async (isPrivate: boolean): Promise<string> => {
    const id = v4();
    const [{ id: applicationId }] = await queryRunner.query(
      `SELECT "id" FROM "core"."application" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await queryRunner.query(
      `INSERT INTO "core"."workflow"
         ("id", "universalIdentifier", "applicationId", "workspaceId", "isPrivate")
       VALUES ($1, $2, $3, $4, $5)`,
      [id, v4(), applicationId, SEED_APPLE_WORKSPACE_ID, isPrivate],
    );

    return id;
  };

  const findVisibility = async (id: string): Promise<string | null> => {
    const [{ visibility }] = await queryRunner.query(
      `SELECT "visibility" FROM "core"."workflow" WHERE "id" = $1`,
      [id],
    );

    return visibility;
  };

  const findVisibilityColumns = () =>
    queryRunner.query(
      `SELECT column_default AS "columnDefault", is_nullable AS "isNullable"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'workflow'
          AND column_name = 'visibility'`,
    );

  const findVisibilityIndexes = () =>
    queryRunner.query(
      `SELECT 1 FROM pg_indexes
        WHERE schemaname = 'core' AND tablename = 'workflow'
          AND indexname = 'IDX_WORKFLOW_VISIBILITY_CREATED_BY'`,
    );

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await dropVisibilityCommand.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('leaves visibility nullable without a default and drops its index', async () => {
    await relaxVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([
      { columnDefault: null, isNullable: 'YES' },
    ]);
    expect(await findVisibilityIndexes()).toEqual([]);
  });

  it('accepts workflows inserted without a visibility', async () => {
    await relaxVisibilityCommand.up(queryRunner);

    const workflowId = await insertWorkflow(true);

    expect(await findVisibility(workflowId)).toBeNull();
  });

  it('fills visibility from isPrivate and restores the constraints on down', async () => {
    await relaxVisibilityCommand.up(queryRunner);

    const privateWorkflowId = await insertWorkflow(true);
    const workspaceWorkflowId = await insertWorkflow(false);

    await relaxVisibilityCommand.down(queryRunner);

    expect(await findVisibility(privateWorkflowId)).toBe('PRIVATE');
    expect(await findVisibility(workspaceWorkflowId)).toBe('WORKSPACE');
    expect(await findVisibilityColumns()).toEqual([
      { columnDefault: "'WORKSPACE'::character varying", isNullable: 'NO' },
    ]);
    expect(await findVisibilityIndexes()).toHaveLength(1);
  });
});
