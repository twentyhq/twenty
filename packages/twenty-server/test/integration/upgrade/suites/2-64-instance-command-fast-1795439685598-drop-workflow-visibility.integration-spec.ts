import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { DropWorkflowVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-instance-command-fast-1795439685598-drop-workflow-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-64 instance command 1795439685598 - drop workflow visibility (integration)', () => {
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

  const findVisibility = async (id: string): Promise<string> => {
    const [{ visibility }] = await queryRunner.query(
      `SELECT "visibility" FROM "core"."workflow" WHERE "id" = $1`,
      [id],
    );

    return visibility;
  };

  const findVisibilityColumns = () =>
    queryRunner.query(
      `SELECT column_name AS "columnName"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'workflow'
          AND column_name = 'visibility'`,
    );

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('drops the visibility column', async () => {
    await dropVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([]);
  });

  it('restores visibility from isPrivate on down', async () => {
    await dropVisibilityCommand.up(queryRunner);

    const privateWorkflowId = await insertWorkflow(true);
    const workspaceWorkflowId = await insertWorkflow(false);

    await dropVisibilityCommand.down(queryRunner);

    expect(await findVisibility(privateWorkflowId)).toBe('PRIVATE');
    expect(await findVisibility(workspaceWorkflowId)).toBe('WORKSPACE');
  });

  it('drops the restored column again on up', async () => {
    await dropVisibilityCommand.down(queryRunner);
    await dropVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([]);
  });
});
