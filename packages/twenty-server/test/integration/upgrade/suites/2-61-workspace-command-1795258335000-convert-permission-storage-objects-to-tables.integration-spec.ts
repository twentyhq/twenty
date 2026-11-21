import { randomUUID } from 'crypto';

import { restoreLegacyPermissionStorageObjects } from 'test/integration/upgrade/utils/restore-legacy-permission-storage-objects.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConvertPermissionStorageObjectsToTablesCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795258335000-convert-permission-storage-objects-to-tables.command';
import { PERMISSION_STORAGE_OBJECTS_TO_CONVERT } from 'src/database/commands/upgrade-version-command/2-61/constants/permission-storage-objects-to-convert.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const REFERENCE_SCHEMA = getWorkspaceSchemaName(SEED_YCOMBINATOR_WORKSPACE_ID);
const TABLE_NAMES = PERMISSION_STORAGE_OBJECTS_TO_CONVERT.map(
  ({ tableName }) => tableName,
);
const RECORD_SHARE_ID = randomUUID();
const ACCESS_GROUP_HASH = `convert-permission-storage-${randomUUID()}`;

const findTableShape = async ({
  schemaName,
  tableName,
}: {
  schemaName: string;
  tableName: string;
}) => {
  const columns: Record<string, unknown>[] = await global.testDataSource.query(
    `SELECT column_name, udt_name, is_nullable, is_identity,
       replace(column_default, $1, 'schema') AS column_default
     FROM information_schema.columns
     WHERE table_schema = $1 AND table_name = $2
     ORDER BY column_name`,
    [schemaName, tableName],
  );
  const indexes: Record<string, unknown>[] = await global.testDataSource.query(
    `SELECT indexname, replace(indexdef, $1, 'schema') AS indexdef
     FROM pg_indexes WHERE schemaname = $1 AND tablename = $2
     ORDER BY indexname`,
    [schemaName, tableName],
  );

  return { columns, indexes };
};

const findRows = (tableName: string) =>
  global.testDataSource.query(
    `SELECT * FROM "${SCHEMA}"."${tableName}" ORDER BY "id"`,
  );

const findPermissionStorageObjectNames = async (): Promise<string[]> =>
  (
    await global.testDataSource.query(
      `SELECT "nameSingular" FROM core."objectMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)
       ORDER BY "nameSingular"`,
      [
        SEED_APPLE_WORKSPACE_ID,
        PERMISSION_STORAGE_OBJECTS_TO_CONVERT.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      ],
    )
  ).map(({ nameSingular }: { nameSingular: string }) => nameSingular);

describe('2-61 workspace command - convert permission storage objects to tables (integration)', () => {
  let command: ConvertPermissionStorageObjectsToTablesCommand;
  const rowsBeforeByTableName = new Map<string, unknown[]>();

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  beforeAll(async () => {
    command =
      getAppProviderByClassName<ConvertPermissionStorageObjectsToTablesCommand>(
        'ConvertPermissionStorageObjectsToTablesCommand',
      );

    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."recordShare"
         ("id", "recordId", "objectMetadataId", "principalId", "principalType", "rowCause", "sourceId", "accessLevel")
       VALUES ($1, $2, $3, $4, 'WORKSPACE_MEMBER', 'MANUAL', $5, 'READ_WRITE')`,
      [RECORD_SHARE_ID, randomUUID(), randomUUID(), randomUUID(), randomUUID()],
    );
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."accessGroup" ("roleId", "groupHash")
       VALUES ($1, $2)`,
      [randomUUID(), ACCESS_GROUP_HASH],
    );

    for (const tableName of TABLE_NAMES) {
      rowsBeforeByTableName.set(tableName, await findRows(tableName));
    }

    await restoreLegacyPermissionStorageObjects(SEED_APPLE_WORKSPACE_ID);
  });

  afterAll(async () => {
    await runOnWorkspace();
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."recordShare" WHERE "id" = $1`,
      [RECORD_SHARE_ID],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."accessGroup" WHERE "groupHash" = $1`,
      [ACCESS_GROUP_HASH],
    );
  });

  it('starts from a workspace with both standard objects and their standard object columns', async () => {
    expect(await findPermissionStorageObjectNames()).toEqual([
      'accessGroup',
      'recordShare',
    ]);

    const { columns } = await findTableShape({
      schemaName: SCHEMA,
      tableName: 'recordShare',
    });

    expect(columns.map(({ column_name }) => column_name)).toEqual(
      expect.arrayContaining(['createdBySource', 'position', 'searchVector']),
    );
  });

  it('leaves the standard objects in place on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await findPermissionStorageObjectNames()).toEqual([
      'accessGroup',
      'recordShare',
    ]);
  });

  it('removes both standard objects and keeps every row', async () => {
    await runOnWorkspace();

    expect(await findPermissionStorageObjectNames()).toEqual([]);

    for (const tableName of TABLE_NAMES) {
      expect(await findRows(tableName)).toEqual(
        rowsBeforeByTableName.get(tableName),
      );
    }
  });

  it('leaves tables shaped like the permission tables of a workspace created with them', async () => {
    for (const tableName of TABLE_NAMES) {
      expect(await findTableShape({ schemaName: SCHEMA, tableName })).toEqual(
        await findTableShape({ schemaName: REFERENCE_SCHEMA, tableName }),
      );
    }
  });

  it('changes nothing when run again', async () => {
    await runOnWorkspace();

    expect(await findPermissionStorageObjectNames()).toEqual([]);

    for (const tableName of TABLE_NAMES) {
      expect(await findRows(tableName)).toEqual(
        rowsBeforeByTableName.get(tableName),
      );
    }
  });
});
