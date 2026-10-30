import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAccessGroupStorageColumnsCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793391296027-add-access-group-storage-columns.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const RECORD_TABLE_NAMES = ['person', '_pet'];
const RECORD_COLUMN_NAMES = [
  'readableByAccessGroupIds',
  'writableByAccessGroupIds',
];

type ColumnRow = {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: string;
  columnDefault: string | null;
  isIdentity: string;
};

describe('2-55 workspace command - add access group storage columns (integration)', () => {
  let command: AddAccessGroupStorageColumnsCommand;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findColumns = (): Promise<ColumnRow[]> =>
    global.testDataSource.query(
      `SELECT table_name AS "tableName", column_name AS "columnName",
              udt_name AS "dataType", is_nullable AS "isNullable",
              column_default AS "columnDefault", is_identity AS "isIdentity"
       FROM information_schema.columns
       WHERE table_schema = $1
         AND column_name IN ('readableByAccessGroupIds', 'writableByAccessGroupIds', 'compactId')
       ORDER BY table_name, column_name`,
      [SCHEMA],
    );

  const findIndexDefinitions = async (): Promise<string[]> => {
    const indexes: { definition: string }[] = await global.testDataSource.query(
      `SELECT pg_get_indexdef(i.indexrelid) AS definition
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname LIKE 'IDX_ACCESS_GROUP_%' AND i.indisvalid`,
      [SCHEMA],
    );

    return indexes.map(({ definition }) => definition);
  };

  const dropStorage = async () => {
    for (const tableName of RECORD_TABLE_NAMES) {
      await global.testDataSource.query(
        `ALTER TABLE "${SCHEMA}"."${tableName}"
         DROP COLUMN "readableByAccessGroupIds",
         DROP COLUMN "writableByAccessGroupIds"`,
      );
    }

    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."accessGroup" DROP COLUMN "compactId"`,
    );
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddAccessGroupStorageColumnsCommand>(
      'AddAccessGroupStorageColumnsCommand',
    );
  });

  afterAll(async () => {
    await runOnWorkspace();
  });

  it('creates the columns and indexes with standard and custom objects', async () => {
    const columns = await findColumns();

    for (const tableName of RECORD_TABLE_NAMES) {
      expect(
        columns.filter((column) => column.tableName === tableName),
      ).toEqual(
        RECORD_COLUMN_NAMES.map((columnName) => ({
          tableName,
          columnName,
          dataType: '_int4',
          isNullable: 'NO',
          columnDefault: "'{}'::integer[]",
          isIdentity: 'NO',
        })),
      );
    }

    expect(
      columns.filter((column) => column.tableName === 'accessGroup'),
    ).toEqual([
      expect.objectContaining({
        columnName: 'compactId',
        dataType: 'int4',
        isIdentity: 'YES',
      }),
    ]);

    const indexDefinitions = await findIndexDefinitions();

    expect(
      indexDefinitions.filter((definition) =>
        definition.includes('USING gin ("readableByAccessGroupIds")'),
      ).length,
    ).toBeGreaterThanOrEqual(RECORD_TABLE_NAMES.length);
    expect(
      indexDefinitions.some((definition) =>
        definition.includes('writableByAccessGroupIds'),
      ),
    ).toBe(false);
  });

  it('leaves dropped columns absent on a dry run', async () => {
    await dropStorage();
    const indexCountBeforeDryRun = (await findIndexDefinitions()).length;

    await runOnWorkspace({ dryRun: true });

    const columnTableNames = (await findColumns()).map(
      (column) => column.tableName,
    );

    for (const tableName of [...RECORD_TABLE_NAMES, 'accessGroup']) {
      expect(columnTableNames).not.toContain(tableName);
    }
    expect(await findIndexDefinitions()).toHaveLength(indexCountBeforeDryRun);
  });

  it('adds the columns and indexes back once', async () => {
    const columnsAfterDrop = await findColumns();
    const indexDefinitionsAfterDrop = await findIndexDefinitions();

    await runOnWorkspace();
    await runOnWorkspace();

    const columns = await findColumns();

    expect(columns.length).toBeGreaterThan(columnsAfterDrop.length);
    for (const tableName of RECORD_TABLE_NAMES) {
      expect(
        columns
          .filter((column) => column.tableName === tableName)
          .map((column) => column.columnName),
      ).toEqual(RECORD_COLUMN_NAMES);
    }
    expect(
      columns.find((column) => column.tableName === 'accessGroup'),
    ).toMatchObject({ columnName: 'compactId', isIdentity: 'YES' });
    expect((await findIndexDefinitions()).length).toBeGreaterThan(
      indexDefinitionsAfterDrop.length,
    );
  });

  it('gives existing records empty arrays and access groups distinct compact ids', async () => {
    const [{ count: recordsWithoutEmptyArrays }]: { count: string }[] =
      await global.testDataSource.query(
        `SELECT count(*) FROM "${SCHEMA}"."person"
         WHERE "readableByAccessGroupIds" <> '{}' OR "writableByAccessGroupIds" <> '{}'`,
      );

    expect(Number(recordsWithoutEmptyArrays)).toBe(0);

    const roleId = randomUUID();

    try {
      const compactIds: { compactId: number }[] = [];

      for (const groupHash of [randomUUID(), randomUUID()]) {
        const [row]: { compactId: number }[] =
          await global.testDataSource.query(
            `INSERT INTO "${SCHEMA}"."accessGroup" ("roleId", "groupHash")
             VALUES ($1, $2) RETURNING "compactId"`,
            [roleId, groupHash],
          );

        compactIds.push(row);
      }

      expect(compactIds[1].compactId).toBeGreaterThan(compactIds[0].compactId);
      await expect(
        global.testDataSource.query(
          `INSERT INTO "${SCHEMA}"."accessGroup" ("roleId", "groupHash", "compactId")
           VALUES ($1, $2, 1)`,
          [roleId, randomUUID()],
        ),
      ).rejects.toThrow(/cannot insert a non-DEFAULT value/);
    } finally {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."accessGroup" WHERE "roleId" = $1`,
        [roleId],
      );
    }
  });
});
