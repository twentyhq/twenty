import { type QueryRunner } from 'typeorm';

import { DropViewDeletedAtFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-instance-command-fast-1795521382000-drop-view-deleted-at';

jest.useRealTimers();

const VIEW_TABLE_NAMES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

describe('2-64 instance command 1795521382000 - drop view deletedAt (integration)', () => {
  const dropViewDeletedAtCommand = new DropViewDeletedAtFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findDeletedAtTableNames = async (): Promise<string[]> => {
    const rows: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = ANY($1)
          AND column_name = 'deletedAt'`,
      [VIEW_TABLE_NAMES],
    );

    return rows.map(({ tableName }) => tableName).sort();
  };

  const findUniqueIndexDefinitions = async (): Promise<
    Record<string, string>
  > => {
    const rows: { indexName: string; indexDefinition: string }[] =
      await queryRunner.query(
        `SELECT indexname AS "indexName", indexdef AS "indexDefinition"
           FROM pg_indexes
          WHERE schemaname = 'core'
            AND indexname IN (
              'IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
              'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE'
            )`,
      );

    return Object.fromEntries(
      rows.map(({ indexName, indexDefinition }) => [
        indexName,
        indexDefinition,
      ]),
    );
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

  it('drops deletedAt from every view table and keeps the unique indexes without it', async () => {
    await dropViewDeletedAtCommand.up(queryRunner);

    expect(await findDeletedAtTableNames()).toEqual([]);

    const indexDefinitions = await findUniqueIndexDefinitions();

    expect(
      indexDefinitions.IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE,
    ).toContain('WHERE ("isCanonical" = true)');
    expect(
      indexDefinitions.IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE,
    ).not.toContain('WHERE');
  });

  it('restores the columns and the deletedAt index predicates on down', async () => {
    await dropViewDeletedAtCommand.up(queryRunner);
    await dropViewDeletedAtCommand.down(queryRunner);

    expect(await findDeletedAtTableNames()).toEqual(
      [...VIEW_TABLE_NAMES].sort(),
    );

    const indexDefinitions = await findUniqueIndexDefinitions();

    expect(
      indexDefinitions.IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE,
    ).toContain('"deletedAt" IS NULL');
    expect(
      indexDefinitions.IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE,
    ).toContain('"deletedAt" IS NULL');
  });

  it('drops the restored columns again on up', async () => {
    await dropViewDeletedAtCommand.down(queryRunner);
    await dropViewDeletedAtCommand.up(queryRunner);

    expect(await findDeletedAtTableNames()).toEqual([]);
  });
});
