import { randomUUID } from 'node:crypto';

import { type QueryRunner } from 'typeorm';

import { RelaxViewDeletedAtFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-instance-command-fast-1795704573519-relax-view-deleted-at';

jest.useRealTimers();

describe('2-65 instance command 1795704573519 - relax view deletedAt (integration)', () => {
  const relaxDeletedAtCommand = new RelaxViewDeletedAtFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findUniqueIndexDefinitions = async (): Promise<string[]> => {
    const rows: { indexdef: string }[] = await queryRunner.query(
      `SELECT indexdef FROM pg_indexes
        WHERE schemaname = 'core'
          AND indexname IN (
            'IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
            'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE'
          )
        ORDER BY indexname`,
    );

    return rows.map(({ indexdef }) => indexdef);
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await relaxDeletedAtCommand.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('rebuilds the unique indexes without the deletedAt condition', async () => {
    await relaxDeletedAtCommand.up(queryRunner);

    const [viewFieldIndex, viewSortIndex] = await findUniqueIndexDefinitions();

    expect(viewFieldIndex).not.toContain('deletedAt');
    expect(viewFieldIndex).toContain('"isCanonical" = true');
    expect(viewSortIndex).not.toContain('deletedAt');
    expect(viewSortIndex).not.toContain('WHERE');
  });

  const findLiveViewField = async (): Promise<{
    id: string;
    viewId: string;
  }> => {
    const [liveViewField]: { id: string; viewId: string }[] =
      await queryRunner.query(
        `SELECT "id", "viewId" FROM "core"."viewField"
          WHERE "deletedAt" IS NULL AND "isCanonical" = true
          LIMIT 1`,
      );

    return liveViewField;
  };

  const copyRow = async ({
    tableName,
    sourceId,
    overrides,
  }: {
    tableName: 'view' | 'viewField';
    sourceId: string;
    overrides: Record<string, string | null>;
  }): Promise<void> => {
    await queryRunner.query(
      `INSERT INTO "core"."${tableName}"
        SELECT (jsonb_populate_record(
          NULL::"core"."${tableName}",
          to_jsonb("source") || $1::jsonb
        )).*
        FROM "core"."${tableName}" "source"
        WHERE "source"."id" = $2`,
      [JSON.stringify(overrides), sourceId],
    );
  };

  const findExistingIds = async ({
    tableName,
    ids,
  }: {
    tableName: 'view' | 'viewField';
    ids: string[];
  }): Promise<string[]> => {
    const rows: { id: string }[] = await queryRunner.query(
      `SELECT "id" FROM "core"."${tableName}" WHERE "id" = ANY($1)`,
      [ids],
    );

    return rows.map(({ id }) => id);
  };

  it('hard-deletes soft-deleted view fields and keeps live ones', async () => {
    const liveViewField = await findLiveViewField();
    const softDeletedViewFieldId = randomUUID();

    await copyRow({
      tableName: 'viewField',
      sourceId: liveViewField.id,
      overrides: {
        id: softDeletedViewFieldId,
        universalIdentifier: softDeletedViewFieldId,
        deletedAt: new Date().toISOString(),
      },
    });

    await relaxDeletedAtCommand.up(queryRunner);

    expect(
      await findExistingIds({
        tableName: 'viewField',
        ids: [liveViewField.id, softDeletedViewFieldId],
      }),
    ).toEqual([liveViewField.id]);
  });

  it('hard-deletes soft-deleted views with all their children', async () => {
    const liveViewField = await findLiveViewField();
    const softDeletedViewId = randomUUID();
    const childViewFieldId = randomUUID();

    await copyRow({
      tableName: 'view',
      sourceId: liveViewField.viewId,
      overrides: {
        id: softDeletedViewId,
        universalIdentifier: softDeletedViewId,
        deletedAt: new Date().toISOString(),
      },
    });
    await copyRow({
      tableName: 'viewField',
      sourceId: liveViewField.id,
      overrides: {
        id: childViewFieldId,
        universalIdentifier: childViewFieldId,
        viewId: softDeletedViewId,
      },
    });

    await relaxDeletedAtCommand.up(queryRunner);

    expect(
      await findExistingIds({
        tableName: 'view',
        ids: [liveViewField.viewId, softDeletedViewId],
      }),
    ).toEqual([liveViewField.viewId]);
    expect(
      await findExistingIds({
        tableName: 'viewField',
        ids: [childViewFieldId],
      }),
    ).toEqual([]);
  });

  it('restores the deletedAt condition on down', async () => {
    const [viewFieldIndex, viewSortIndex] = await findUniqueIndexDefinitions();

    expect(viewFieldIndex).toContain('"deletedAt" IS NULL');
    expect(viewSortIndex).toContain('"deletedAt" IS NULL');
  });
});
