import { type QueryRunner } from 'typeorm';

import { DropViewVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-instance-command-fast-1795703218960-drop-view-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-65 instance command 1795703218960 - drop view visibility (integration)', () => {
  const dropVisibilityCommand = new DropViewVisibilityFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findSeededViewIds = async (count: number): Promise<string[]> => {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."view" WHERE "workspaceId" = $1 ORDER BY "id" LIMIT $2`,
      [SEED_APPLE_WORKSPACE_ID, count],
    );

    return rows.map(({ id }) => id);
  };

  const setIsPrivate = (viewId: string, isPrivate: boolean) =>
    queryRunner.query(
      `UPDATE "core"."view" SET "isPrivate" = $2 WHERE "id" = $1`,
      [viewId, isPrivate],
    );

  const findVisibility = async (viewId: string): Promise<string> => {
    const [{ visibility }] = await queryRunner.query(
      `SELECT "visibility" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );

    return visibility;
  };

  const findVisibilityColumns = () =>
    queryRunner.query(
      `SELECT column_name AS "columnName"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name = 'visibility'`,
    );

  const findVisibilityTypes = () =>
    queryRunner.query(
      `SELECT typname FROM pg_type
        WHERE typname = 'view_visibility_enum'`,
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

  it('drops the visibility column and its enum type', async () => {
    await dropVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([]);
    expect(await findVisibilityTypes()).toEqual([]);
  });

  it('restores visibility from isPrivate on down', async () => {
    await dropVisibilityCommand.up(queryRunner);

    const [privateViewId, sharedViewId] = await findSeededViewIds(2);

    await setIsPrivate(privateViewId, true);
    await setIsPrivate(sharedViewId, false);

    await dropVisibilityCommand.down(queryRunner);

    expect(await findVisibility(privateViewId)).toBe('UNLISTED');
    expect(await findVisibility(sharedViewId)).toBe('WORKSPACE');
  });

  it('drops the restored column again on up', async () => {
    await dropVisibilityCommand.up(queryRunner);
    await dropVisibilityCommand.down(queryRunner);
    await dropVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([]);
  });
});
