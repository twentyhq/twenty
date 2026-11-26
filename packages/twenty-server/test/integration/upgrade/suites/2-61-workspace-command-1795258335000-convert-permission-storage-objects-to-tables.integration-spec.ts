import { randomUUID } from 'crypto';

import { findWorkspaceTableShape } from 'test/integration/upgrade/utils/find-workspace-table-shape.util';
import { restoreLegacyPermissionStorageObjects } from 'test/integration/upgrade/utils/restore-legacy-permission-storage-objects.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConvertPermissionStorageObjectsToTablesCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795258335000-convert-permission-storage-objects-to-tables.command';
import { type TypeAccessGroupsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795264768000-type-access-groups.command';
import { PERMISSION_STORAGE_OBJECTS_TO_CONVERT } from 'src/database/commands/upgrade-version-command/2-61/constants/permission-storage-objects-to-convert.constant';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const REFERENCE_SCHEMA = getWorkspaceSchemaName(SEED_YCOMBINATOR_WORKSPACE_ID);
const RECORD_SHARE_ID = randomUUID();

const findRecordShareRows = () =>
  global.testDataSource.query(
    `SELECT * FROM "${SCHEMA}"."recordShare" ORDER BY "id"`,
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
  let typeAccessGroupsCommand: TypeAccessGroupsCommand;
  let recordShareRowsBefore: unknown[];

  const runOnWorkspaceArgs = (options: { dryRun?: boolean } = {}) => ({
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
    typeAccessGroupsCommand =
      getAppProviderByClassName<TypeAccessGroupsCommand>(
        'TypeAccessGroupsCommand',
      );

    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."recordShare"
         ("id", "recordId", "objectMetadataId", "principalId", "principalType", "rowCause", "sourceId", "accessLevel")
       VALUES ($1, $2, $3, $4, 'WORKSPACE_MEMBER', 'MANUAL', $5, 'READ_WRITE')`,
      [RECORD_SHARE_ID, randomUUID(), randomUUID(), randomUUID(), randomUUID()],
    );

    recordShareRowsBefore = await findRecordShareRows();

    await restoreLegacyPermissionStorageObjects(SEED_APPLE_WORKSPACE_ID);
  });

  afterAll(async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());
    await typeAccessGroupsCommand.runOnWorkspace(runOnWorkspaceArgs());
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."recordShare" WHERE "id" = $1`,
      [RECORD_SHARE_ID],
    );
  });

  it('starts from a workspace with both standard objects and their standard object columns', async () => {
    expect(await findPermissionStorageObjectNames()).toEqual([
      'accessGroup',
      'recordShare',
    ]);

    const { columns } = await findWorkspaceTableShape({
      schemaName: SCHEMA,
      tableName: 'recordShare',
    });

    expect(columns.map(({ column_name }) => column_name)).toEqual(
      expect.arrayContaining(['createdBySource', 'position', 'searchVector']),
    );
  });

  it('leaves the standard objects in place on a dry run', async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs({ dryRun: true }));

    expect(await findPermissionStorageObjectNames()).toEqual([
      'accessGroup',
      'recordShare',
    ]);
  });

  it('removes both standard objects and keeps every record share', async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());

    expect(await findPermissionStorageObjectNames()).toEqual([]);
    expect(await findRecordShareRows()).toEqual(recordShareRowsBefore);
  });

  it('leaves a recordShare table shaped like the one of a workspace created with it', async () => {
    expect(
      await findWorkspaceTableShape({
        schemaName: SCHEMA,
        tableName: 'recordShare',
      }),
    ).toEqual(
      await findWorkspaceTableShape({
        schemaName: REFERENCE_SCHEMA,
        tableName: 'recordShare',
      }),
    );
  });

  it('changes nothing when run again', async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());

    expect(await findPermissionStorageObjectNames()).toEqual([]);
    expect(await findRecordShareRows()).toEqual(recordShareRowsBefore);
  });
});
