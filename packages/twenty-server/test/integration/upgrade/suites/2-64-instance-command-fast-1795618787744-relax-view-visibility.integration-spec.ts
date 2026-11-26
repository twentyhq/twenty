import { type QueryRunner } from 'typeorm';

import { RelaxViewVisibilityFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-instance-command-fast-1795618787744-relax-view-visibility';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

describe('2-64 instance command 1795618787744 - relax view visibility (integration)', () => {
  const relaxVisibilityCommand = new RelaxViewVisibilityFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findSeededViewIds = async (count: number): Promise<string[]> => {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."view" WHERE "workspaceId" = $1 ORDER BY "id" LIMIT $2`,
      [SEED_APPLE_WORKSPACE_ID, count],
    );

    return rows.map(({ id }) => id);
  };

  const clearVisibility = async ({
    viewId,
    isPrivate,
  }: {
    viewId: string;
    isPrivate: boolean;
  }) => {
    await queryRunner.query(
      `UPDATE "core"."view" SET "visibility" = NULL, "isPrivate" = $2 WHERE "id" = $1`,
      [viewId, isPrivate],
    );
  };

  const findVisibility = async (viewId: string): Promise<string | null> => {
    const [{ visibility }] = await queryRunner.query(
      `SELECT "visibility" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );

    return visibility;
  };

  const findVisibilityColumns = () =>
    queryRunner.query(
      `SELECT column_default AS "columnDefault", is_nullable AS "isNullable"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name = 'visibility'`,
    );

  const findVisibilityIndexes = () =>
    queryRunner.query(
      `SELECT 1 FROM pg_indexes
        WHERE schemaname = 'core' AND tablename = 'view'
          AND indexname = 'IDX_VIEW_VISIBILITY'`,
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

  it('leaves visibility nullable without a default and drops its index', async () => {
    await relaxVisibilityCommand.up(queryRunner);

    expect(await findVisibilityColumns()).toEqual([
      { columnDefault: null, isNullable: 'YES' },
    ]);
    expect(await findVisibilityIndexes()).toEqual([]);
  });

  it('fills visibility from isPrivate and restores the constraints on down', async () => {
    await relaxVisibilityCommand.up(queryRunner);

    const [privateViewId, workspaceViewId] = await findSeededViewIds(2);

    await clearVisibility({ viewId: privateViewId, isPrivate: true });
    await clearVisibility({ viewId: workspaceViewId, isPrivate: false });

    await relaxVisibilityCommand.down(queryRunner);

    expect(await findVisibility(privateViewId)).toBe('UNLISTED');
    expect(await findVisibility(workspaceViewId)).toBe('WORKSPACE');
    expect(await findVisibilityColumns()).toEqual([
      {
        columnDefault: "'WORKSPACE'::core.view_visibility_enum",
        isNullable: 'NO',
      },
    ]);
    expect(await findVisibilityIndexes()).toHaveLength(1);
  });
});
