import { BackfillViewIsPrivateOverridesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-instance-command-slow-1795477704495-backfill-view-is-private-overrides';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const AUTHOR_UNIVERSAL_IDENTIFIER = '20202020-aaaa-4aaa-8aaa-000000000001';

type ViewOverridesRow = {
  id: string;
  overrides: Record<string, unknown> | null;
};

describe('2-63 slow instance command 1795477704495 - backfill view isPrivate overrides (integration)', () => {
  const command = new BackfillViewIsPrivateOverridesSlowInstanceCommand();
  let originalRows: ViewOverridesRow[] = [];

  const findSeededViewIds = async (count: number): Promise<string[]> => {
    originalRows = await globalThis.testDataSource.query(
      `SELECT "id", "overrides" FROM "core"."view" WHERE "workspaceId" = $1 ORDER BY "id" LIMIT $2`,
      [SEED_APPLE_WORKSPACE_ID, count],
    );

    return originalRows.map(({ id }) => id);
  };

  const setOverrides = async ({ id, overrides }: ViewOverridesRow) => {
    await globalThis.testDataSource.query(
      `UPDATE "core"."view" SET "overrides" = $2 WHERE "id" = $1`,
      [id, overrides],
    );
  };

  const findOverrides = async (viewId: string) => {
    const [{ overrides }] = await globalThis.testDataSource.query(
      `SELECT "overrides" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );

    return overrides;
  };

  afterEach(async () => {
    for (const originalRow of originalRows) {
      await setOverrides(originalRow);
    }
    originalRows = [];
  });

  it('adds isPrivate next to the visibility overrides', async () => {
    const [authoredViewId, legacyViewId, untouchedViewId] =
      await findSeededViewIds(3);

    await setOverrides({
      id: authoredViewId,
      overrides: {
        [AUTHOR_UNIVERSAL_IDENTIFIER]: { visibility: 'UNLISTED', name: 'Mine' },
      },
    });
    await setOverrides({
      id: legacyViewId,
      overrides: { visibility: 'WORKSPACE' },
    });
    await setOverrides({
      id: untouchedViewId,
      overrides: { [AUTHOR_UNIVERSAL_IDENTIFIER]: { name: 'Renamed' } },
    });

    await command.runDataMigration(globalThis.testDataSource);

    expect(await findOverrides(authoredViewId)).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: {
        visibility: 'UNLISTED',
        isPrivate: true,
        name: 'Mine',
      },
    });
    expect(await findOverrides(legacyViewId)).toEqual({
      visibility: 'WORKSPACE',
      isPrivate: false,
    });
    expect(await findOverrides(untouchedViewId)).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: { name: 'Renamed' },
    });
  });

  it('removes isPrivate from the overrides on down', async () => {
    const [authoredViewId, legacyViewId] = await findSeededViewIds(2);

    await setOverrides({
      id: authoredViewId,
      overrides: {
        [AUTHOR_UNIVERSAL_IDENTIFIER]: {
          visibility: 'UNLISTED',
          isPrivate: true,
        },
      },
    });
    await setOverrides({
      id: legacyViewId,
      overrides: { visibility: 'WORKSPACE', isPrivate: false },
    });

    const queryRunner = globalThis.testDataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await command.down(queryRunner);
    } finally {
      await queryRunner.release();
    }

    expect(await findOverrides(authoredViewId)).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: { visibility: 'UNLISTED' },
    });
    expect(await findOverrides(legacyViewId)).toEqual({
      visibility: 'WORKSPACE',
    });
  });
});
