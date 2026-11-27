import { randomUUID } from 'node:crypto';

import { type QueryRunner } from 'typeorm';

import { RelaxViewDeletedAtSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-instance-command-slow-1795715543417-relax-view-deleted-at';
import { DropViewDeletedAtFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-instance-command-fast-1795795870500-drop-view-deleted-at';

jest.useRealTimers();

describe('2-65 instance command 1795715543417 - relax view deletedAt (integration)', () => {
  const relaxDeletedAtCommand = new RelaxViewDeletedAtSlowInstanceCommand();
  const dropDeletedAtCommand = new DropViewDeletedAtFastInstanceCommand();

  const runOnTestDataSource = async (
    run: (queryRunner: QueryRunner) => Promise<void>,
  ): Promise<void> => {
    const queryRunner = globalThis.testDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await run(queryRunner);
    } finally {
      await queryRunner.release();
    }
  };

  describe('runDataMigration', () => {
    let createdViewIds: string[] = [];
    let createdViewFieldIds: string[] = [];

    beforeAll(async () => {
      await runOnTestDataSource((queryRunner) =>
        dropDeletedAtCommand.down(queryRunner),
      );
    });

    afterAll(async () => {
      await runOnTestDataSource((queryRunner) =>
        dropDeletedAtCommand.up(queryRunner),
      );
    });

    const findLiveViewField = async (): Promise<{
      id: string;
      viewId: string;
    }> => {
      const [liveViewField]: { id: string; viewId: string }[] =
        await globalThis.testDataSource.query(
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
      overrides: Record<string, string | boolean | null>;
    }): Promise<void> => {
      await globalThis.testDataSource.query(
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
      const rows: { id: string }[] = await globalThis.testDataSource.query(
        `SELECT "id" FROM "core"."${tableName}" WHERE "id" = ANY($1)`,
        [ids],
      );

      return rows.map(({ id }) => id);
    };

    afterEach(async () => {
      await globalThis.testDataSource.query(
        `DELETE FROM "core"."viewField" WHERE "id" = ANY($1)`,
        [createdViewFieldIds],
      );
      await globalThis.testDataSource.query(
        `DELETE FROM "core"."view" WHERE "id" = ANY($1)`,
        [createdViewIds],
      );
      createdViewIds = [];
      createdViewFieldIds = [];
    });

    it('hard-deletes soft-deleted view fields and keeps live ones', async () => {
      const liveViewField = await findLiveViewField();
      const softDeletedViewFieldId = randomUUID();

      createdViewFieldIds.push(softDeletedViewFieldId);

      await copyRow({
        tableName: 'viewField',
        sourceId: liveViewField.id,
        overrides: {
          id: softDeletedViewFieldId,
          universalIdentifier: softDeletedViewFieldId,
          isCanonical: false,
          deletedAt: new Date().toISOString(),
        },
      });

      await relaxDeletedAtCommand.runDataMigration(globalThis.testDataSource);

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

      createdViewIds.push(softDeletedViewId);
      createdViewFieldIds.push(childViewFieldId);

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

      await relaxDeletedAtCommand.runDataMigration(globalThis.testDataSource);

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
  });

  describe('up and down', () => {
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
      await dropDeletedAtCommand.down(queryRunner);
      await relaxDeletedAtCommand.down(queryRunner);
    });

    afterEach(async () => {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    });

    it('rebuilds the unique indexes without the deletedAt condition', async () => {
      await relaxDeletedAtCommand.up(queryRunner);

      const [viewFieldIndex, viewSortIndex] =
        await findUniqueIndexDefinitions();

      expect(viewFieldIndex).not.toContain('deletedAt');
      expect(viewFieldIndex).toContain('"isCanonical" = true');
      expect(viewSortIndex).not.toContain('deletedAt');
      expect(viewSortIndex).not.toContain('WHERE');
    });

    it('restores the deletedAt condition on down', async () => {
      const [viewFieldIndex, viewSortIndex] =
        await findUniqueIndexDefinitions();

      expect(viewFieldIndex).toContain('"deletedAt" IS NULL');
      expect(viewSortIndex).toContain('"deletedAt" IS NULL');
    });
  });
});
