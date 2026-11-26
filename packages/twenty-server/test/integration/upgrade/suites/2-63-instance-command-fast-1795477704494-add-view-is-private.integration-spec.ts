import { type QueryRunner } from 'typeorm';

import { AddViewIsPrivateFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-instance-command-fast-1795477704494-add-view-is-private';
import { RelaxViewVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-instance-command-fast-1795618787744-relax-view-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-63 instance command 1795477704494 - add view isPrivate (integration)', () => {
  const addIsPrivateCommand = new AddViewIsPrivateFastInstanceCommand();
  const relaxVisibilityCommand = new RelaxViewVisibilityFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findSeededViewIds = async (count: number): Promise<string[]> => {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."view" WHERE "workspaceId" = $1 ORDER BY "id" LIMIT $2`,
      [SEED_APPLE_WORKSPACE_ID, count],
    );

    return rows.map(({ id }) => id);
  };

  const setVisibility = async ({
    viewId,
    visibility,
  }: {
    viewId: string;
    visibility: string;
  }) => {
    await queryRunner.query(
      `UPDATE "core"."view" SET "visibility" = $2 WHERE "id" = $1`,
      [viewId, visibility],
    );
  };

  const findIsPrivate = async (viewId: string): Promise<boolean> => {
    const [row] = await queryRunner.query(
      `SELECT "isPrivate" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );

    return row.isPrivate;
  };

  const findIsPrivateColumn = async () =>
    queryRunner.query(
      `SELECT column_default AS "columnDefault", is_nullable AS "isNullable"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name = 'isPrivate'`,
    );

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await relaxVisibilityCommand.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('copies the visibility of existing views into isPrivate', async () => {
    await addIsPrivateCommand.down(queryRunner);

    const [unlistedViewId, workspaceViewId] = await findSeededViewIds(2);

    await setVisibility({ viewId: unlistedViewId, visibility: 'UNLISTED' });
    await setVisibility({ viewId: workspaceViewId, visibility: 'WORKSPACE' });

    await addIsPrivateCommand.up(queryRunner);

    expect(await findIsPrivate(unlistedViewId)).toBe(true);
    expect(await findIsPrivate(workspaceViewId)).toBe(false);
  });

  it('drops the column on down', async () => {
    await addIsPrivateCommand.down(queryRunner);

    expect(await findIsPrivateColumn()).toEqual([]);
  });

  it('defaults isPrivate to false after the upgrade', async () => {
    expect(await findIsPrivateColumn()).toEqual([
      { columnDefault: 'false', isNullable: 'NO' },
    ]);
  });
});
