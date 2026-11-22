import { randomUUID } from 'crypto';

import { findWorkspaceTableShape } from 'test/integration/upgrade/utils/find-workspace-table-shape.util';
import { restoreLegacyPermissionStorageObjects } from 'test/integration/upgrade/utils/restore-legacy-permission-storage-objects.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ConvertPermissionStorageObjectsToTablesCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795258335000-convert-permission-storage-objects-to-tables.command';
import { type TypeAccessGroupsCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795264768000-type-access-groups.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const REFERENCE_SCHEMA = getWorkspaceSchemaName(SEED_YCOMBINATOR_WORKSPACE_ID);

const findAccessGroupShape = (schemaName: string) =>
  findWorkspaceTableShape({ schemaName, tableName: 'accessGroup' });

const countAccessGroups = async (): Promise<number> => {
  const [{ count }] = await global.testDataSource.query(
    `SELECT count(*)::int AS count FROM "${SCHEMA}"."accessGroup"`,
  );

  return count;
};

describe('2-61 workspace command - type access groups (integration)', () => {
  let convertCommand: ConvertPermissionStorageObjectsToTablesCommand;
  let command: TypeAccessGroupsCommand;

  const runOnWorkspaceArgs = (options: { dryRun?: boolean } = {}) => ({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    options,
    index: 0,
    total: 1,
    dataSource: global.testDataSource,
  });

  beforeAll(async () => {
    convertCommand =
      getAppProviderByClassName<ConvertPermissionStorageObjectsToTablesCommand>(
        'ConvertPermissionStorageObjectsToTablesCommand',
      );
    command = getAppProviderByClassName<TypeAccessGroupsCommand>(
      'TypeAccessGroupsCommand',
    );

    await restoreLegacyPermissionStorageObjects(SEED_APPLE_WORKSPACE_ID);
    await convertCommand.runOnWorkspace(runOnWorkspaceArgs());

    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."accessGroup" ("roleId", "groupHash")
       VALUES ($1, $2)`,
      [randomUUID(), `type-access-groups-${randomUUID()}`],
    );
  });

  afterAll(async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());
  });

  it('starts from an accessGroup table keyed by role', async () => {
    const { columns } = await findAccessGroupShape(SCHEMA);

    expect(columns.map(({ column_name }) => column_name)).toEqual(
      expect.arrayContaining(['roleId', 'rowLevelPermissionPredicateGroupId']),
    );
    expect(await countAccessGroups()).toBe(1);
  });

  it('changes nothing on a dry run', async () => {
    const shapeBefore = await findAccessGroupShape(SCHEMA);

    await command.runOnWorkspace(runOnWorkspaceArgs({ dryRun: true }));

    expect(await findAccessGroupShape(SCHEMA)).toEqual(shapeBefore);
    expect(await countAccessGroups()).toBe(1);
  });

  it('empties the table and shapes it like the one of a workspace created with it', async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());

    expect(await countAccessGroups()).toBe(0);
    expect(await findAccessGroupShape(SCHEMA)).toEqual(
      await findAccessGroupShape(REFERENCE_SCHEMA),
    );
  });

  it('changes nothing when run again', async () => {
    await command.runOnWorkspace(runOnWorkspaceArgs());

    expect(await findAccessGroupShape(SCHEMA)).toEqual(
      await findAccessGroupShape(REFERENCE_SCHEMA),
    );
  });
});
