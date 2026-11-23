import { type QueryRunner } from 'typeorm';

import { AddViewIsPrivateFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-instance-command-fast-1795437642259-add-view-is-private';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

const AUTHOR_UNIVERSAL_IDENTIFIER = '20202020-aaaa-4aaa-8aaa-000000000001';

type ViewPrivacyRow = {
  isPrivate: boolean;
  visibility: string;
  overrides: Record<string, unknown> | null;
};

describe('2-63 instance command 1795437642259 - add view isPrivate (integration)', () => {
  const addIsPrivateCommand = new AddViewIsPrivateFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findSeededViewIds = async (count: number): Promise<string[]> => {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."view" WHERE "workspaceId" = $1 ORDER BY "id" LIMIT $2`,
      [SEED_APPLE_WORKSPACE_ID, count],
    );

    return rows.map(({ id }) => id);
  };

  const setLegacyPrivacy = async (
    viewId: string,
    {
      visibility,
      overrides,
    }: { visibility: string; overrides: Record<string, unknown> | null },
  ) => {
    await queryRunner.query(
      `UPDATE "core"."view" SET "visibility" = $2, "overrides" = $3 WHERE "id" = $1`,
      [viewId, visibility, overrides],
    );
  };

  const findPrivacyRow = async (viewId: string): Promise<ViewPrivacyRow> => {
    const [row] = await queryRunner.query(
      `SELECT "isPrivate", "visibility", "overrides" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );

    return row;
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('copies the visibility of existing views into isPrivate', async () => {
    await addIsPrivateCommand.down(queryRunner);

    const [unlistedViewId, workspaceViewId] = await findSeededViewIds(2);

    await setLegacyPrivacy(unlistedViewId, {
      visibility: 'UNLISTED',
      overrides: null,
    });
    await setLegacyPrivacy(workspaceViewId, {
      visibility: 'WORKSPACE',
      overrides: null,
    });

    await addIsPrivateCommand.up(queryRunner);

    expect(await findPrivacyRow(unlistedViewId)).toEqual({
      isPrivate: true,
      visibility: 'UNLISTED',
      overrides: null,
    });
    expect(await findPrivacyRow(workspaceViewId)).toEqual({
      isPrivate: false,
      visibility: 'WORKSPACE',
      overrides: null,
    });
  });

  it('adds isPrivate next to the visibility overrides', async () => {
    await addIsPrivateCommand.down(queryRunner);

    const [authoredViewId, legacyViewId, untouchedViewId] =
      await findSeededViewIds(3);

    await setLegacyPrivacy(authoredViewId, {
      visibility: 'WORKSPACE',
      overrides: {
        [AUTHOR_UNIVERSAL_IDENTIFIER]: { visibility: 'UNLISTED', name: 'Mine' },
      },
    });
    await setLegacyPrivacy(legacyViewId, {
      visibility: 'UNLISTED',
      overrides: { visibility: 'WORKSPACE' },
    });
    await setLegacyPrivacy(untouchedViewId, {
      visibility: 'WORKSPACE',
      overrides: { [AUTHOR_UNIVERSAL_IDENTIFIER]: { name: 'Renamed' } },
    });

    await addIsPrivateCommand.up(queryRunner);

    expect((await findPrivacyRow(authoredViewId)).overrides).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: {
        visibility: 'UNLISTED',
        isPrivate: true,
        name: 'Mine',
      },
    });
    expect((await findPrivacyRow(legacyViewId)).overrides).toEqual({
      visibility: 'WORKSPACE',
      isPrivate: false,
    });
    expect((await findPrivacyRow(untouchedViewId)).overrides).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: { name: 'Renamed' },
    });
  });

  it('removes isPrivate from the overrides and drops the column on down', async () => {
    const [viewId] = await findSeededViewIds(1);

    await queryRunner.query(
      `UPDATE "core"."view" SET "overrides" = $2 WHERE "id" = $1`,
      [
        viewId,
        {
          [AUTHOR_UNIVERSAL_IDENTIFIER]: {
            visibility: 'UNLISTED',
            isPrivate: true,
          },
        },
      ],
    );

    await addIsPrivateCommand.down(queryRunner);

    const [{ overrides }] = await queryRunner.query(
      `SELECT "overrides" FROM "core"."view" WHERE "id" = $1`,
      [viewId],
    );
    const columns = await queryRunner.query(
      `SELECT column_name AS "columnName"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name = 'isPrivate'`,
    );

    expect(overrides).toEqual({
      [AUTHOR_UNIVERSAL_IDENTIFIER]: { visibility: 'UNLISTED' },
    });
    expect(columns).toEqual([]);
  });

  it('defaults isPrivate to false after the upgrade', async () => {
    const [{ columnDefault, isNullable }] = await queryRunner.query(
      `SELECT column_default AS "columnDefault", is_nullable AS "isNullable"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'view'
          AND column_name = 'isPrivate'`,
    );

    expect({ columnDefault, isNullable }).toEqual({
      columnDefault: 'false',
      isNullable: 'NO',
    });
  });
});
