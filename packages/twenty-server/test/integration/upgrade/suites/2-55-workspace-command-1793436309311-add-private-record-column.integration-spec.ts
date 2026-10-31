import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddPrivateRecordColumnCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793436309311-add-private-record-column.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

type ColumnRow = {
  tableName: string;
  dataType: string;
  isNullable: string;
  columnDefault: string | null;
};

describe('2-55 workspace command - add private record column (integration)', () => {
  let command: AddPrivateRecordColumnCommand;
  let personObjectMetadataId: string;

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
      `SELECT table_name AS "tableName", udt_name AS "dataType",
              is_nullable AS "isNullable", column_default AS "columnDefault"
       FROM information_schema.columns
       WHERE table_schema = $1 AND column_name = '_isPrivate'
       ORDER BY table_name`,
      [SCHEMA],
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<AddPrivateRecordColumnCommand>(
      'AddPrivateRecordColumnCommand',
    );

    [{ id: personObjectMetadataId }] = await global.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
  });

  it('creates the column on standard and custom objects, not on permission storage', async () => {
    const columns = await findColumns();

    for (const tableName of ['person', '_pet']) {
      expect(columns).toContainEqual({
        tableName,
        dataType: 'bool',
        isNullable: 'NO',
        columnDefault: 'false',
      });
    }
    expect(
      columns.filter(({ tableName }) =>
        ['recordShare', 'accessGroup'].includes(tableName),
      ),
    ).toEqual([]);

    const [{ definition }] = await global.testDataSource.query(
      `SELECT pg_get_indexdef(i.indexrelid) AS definition
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2`,
      [
        SCHEMA,
        `IDX_PRIVATE_RECORD_${personObjectMetadataId.replace(/-/g, '')}`,
      ],
    );

    expect(definition).toContain('WHERE "_isPrivate"');
  });

  it('adds a missing column back, but not on a dry run', async () => {
    await global.testDataSource.query(
      `ALTER TABLE "${SCHEMA}"."_pet" DROP COLUMN "_isPrivate"`,
    );

    await runOnWorkspace({ dryRun: true });
    expect(
      (await findColumns()).some(({ tableName }) => tableName === '_pet'),
    ).toBe(false);

    await runOnWorkspace();
    await runOnWorkspace();
    expect(
      (await findColumns()).filter(({ tableName }) => tableName === '_pet'),
    ).toHaveLength(1);
  });
});
