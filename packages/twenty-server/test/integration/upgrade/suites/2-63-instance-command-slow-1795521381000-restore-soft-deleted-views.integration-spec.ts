import { v4 } from 'uuid';

import { RestoreSoftDeletedViewsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-63/2-63-instance-command-slow-1795521381000-restore-soft-deleted-views';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.useRealTimers();

type SeededViewField = {
  id: string;
  viewId: string;
};

describe('2-63 slow instance command 1795521381000 - restore soft-deleted views (integration)', () => {
  const command = new RestoreSoftDeletedViewsSlowInstanceCommand();
  let duplicatedViewFieldIds: string[] = [];

  const findSeededCanonicalViewField = async (): Promise<SeededViewField> => {
    const [viewField] = await globalThis.testDataSource.query(
      `SELECT "id", "viewId" FROM "core"."viewField"
        WHERE "workspaceId" = $1 AND "isCanonical" = true
        ORDER BY "id" LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    return viewField;
  };

  const insertSoftDeletedViewFieldCopy = async (
    viewFieldId: string,
  ): Promise<string> => {
    const copiedViewFieldId = v4();
    const copiedColumns: { columnName: string }[] =
      await globalThis.testDataSource.query(
        `SELECT column_name AS "columnName"
           FROM information_schema.columns
          WHERE table_schema = 'core' AND table_name = 'viewField'
            AND column_name NOT IN ('id', 'universalIdentifier', 'deletedAt')`,
      );
    const copiedColumnList = copiedColumns
      .map(({ columnName }) => `"${columnName}"`)
      .join(', ');

    await globalThis.testDataSource.query(
      `INSERT INTO "core"."viewField" ("id", "universalIdentifier", "deletedAt", ${copiedColumnList})
       SELECT $2, $3, NOW(), ${copiedColumnList}
         FROM "core"."viewField" WHERE "id" = $1`,
      [viewFieldId, copiedViewFieldId, v4()],
    );
    duplicatedViewFieldIds.push(copiedViewFieldId);

    return copiedViewFieldId;
  };

  const findDeletedAt = async (
    tableName: string,
    id: string,
  ): Promise<string | null | undefined> => {
    const [row] = await globalThis.testDataSource.query(
      `SELECT "deletedAt" FROM "core"."${tableName}" WHERE "id" = $1`,
      [id],
    );

    return row?.deletedAt;
  };

  const setDeletedAt = async (tableName: string, id: string) => {
    await globalThis.testDataSource.query(
      `UPDATE "core"."${tableName}" SET "deletedAt" = NOW() WHERE "id" = $1`,
      [id],
    );
  };

  afterEach(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "core"."viewField" WHERE "id" = ANY($1)`,
      [duplicatedViewFieldIds],
    );
    duplicatedViewFieldIds = [];
  });

  it('clears deletedAt on soft-deleted views and view children', async () => {
    const { id: viewFieldId, viewId } = await findSeededCanonicalViewField();

    await setDeletedAt('view', viewId);
    await setDeletedAt('viewField', viewFieldId);

    await command.runDataMigration(globalThis.testDataSource);

    expect(await findDeletedAt('view', viewId)).toBeNull();
    expect(await findDeletedAt('viewField', viewFieldId)).toBeNull();
  });

  it('deletes a soft-deleted view field that duplicates a live canonical one', async () => {
    const { id: liveViewFieldId } = await findSeededCanonicalViewField();
    const softDeletedViewFieldId =
      await insertSoftDeletedViewFieldCopy(liveViewFieldId);

    await command.runDataMigration(globalThis.testDataSource);

    expect(
      await findDeletedAt('viewField', softDeletedViewFieldId),
    ).toBeUndefined();
    expect(await findDeletedAt('viewField', liveViewFieldId)).toBeNull();
  });

  it('keeps one of two soft-deleted duplicates when no live view field remains', async () => {
    const { id: viewFieldId } = await findSeededCanonicalViewField();
    const firstCopyId = await insertSoftDeletedViewFieldCopy(viewFieldId);
    const secondCopyId = await insertSoftDeletedViewFieldCopy(viewFieldId);

    await globalThis.testDataSource.query(
      `UPDATE "core"."viewField" SET "isCanonical" = false WHERE "id" = $1`,
      [viewFieldId],
    );

    try {
      await command.runDataMigration(globalThis.testDataSource);

      const remainingDeletedAts = [
        await findDeletedAt('viewField', firstCopyId),
        await findDeletedAt('viewField', secondCopyId),
      ];

      expect(
        remainingDeletedAts.filter((deletedAt) => deletedAt === null),
      ).toHaveLength(1);
      expect(
        remainingDeletedAts.filter((deletedAt) => deletedAt === undefined),
      ).toHaveLength(1);
    } finally {
      await globalThis.testDataSource.query(
        `DELETE FROM "core"."viewField" WHERE "id" = ANY($1)`,
        [duplicatedViewFieldIds],
      );
      duplicatedViewFieldIds = [];
      await globalThis.testDataSource.query(
        `UPDATE "core"."viewField" SET "isCanonical" = true WHERE "id" = $1`,
        [viewFieldId],
      );
    }
  });
});
