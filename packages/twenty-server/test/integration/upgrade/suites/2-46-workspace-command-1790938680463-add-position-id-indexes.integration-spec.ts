import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddPositionIdIndexesCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1790938680463-add-position-id-indexes.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schemaName = getWorkspaceSchemaName(workspaceId);

describe('2-46 workspace command 1790938680463 - AddPositionIdIndexesCommand (integration)', () => {
  let command: AddPositionIdIndexesCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const run = async (
    direction: 'up' | 'down',
    { dryRun = false }: { dryRun?: boolean } = {},
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      async () =>
        command[direction]({
          workspaceId,
          options: { dryRun },
          index: 0,
          total: 1,
          dataSource: globalThis.testDataSource,
        }),
      buildSystemAuthContext(workspaceId),
    );

  const findPositionIdIndexedTables = async (): Promise<string[]> =>
    (
      await globalThis.testDataSource.query(
        `SELECT t.relname AS "tableName"
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_class t ON t.oid = i.indrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1
           AND i.indisvalid
           AND pg_get_indexdef(i.indexrelid) LIKE '%("position", id)'`,
        [schemaName],
      )
    )
      .map(({ tableName }: { tableName: string }) => tableName)
      .sort();

  beforeAll(() => {
    command = getAppProviderByClassName<AddPositionIdIndexesCommand>(
      'AddPositionIdIndexesCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await run('up');
  });

  it('is registered in the 2.46 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.46.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790938680463 }),
      ]),
    );
  });

  it('indexes the lists people browse, and leaves system objects alone', async () => {
    const indexedTables = await findPositionIdIndexedTables();

    expect(indexedTables).toEqual(
      expect.arrayContaining(['company', 'person', 'opportunity']),
    );
    expect(indexedTables).not.toContain('recordShare');
    expect(indexedTables).not.toContain('timelineActivity');
  });

  it('removes the indexes on the way down and rebuilds them on the way up', async () => {
    const indexedTables = await findPositionIdIndexedTables();

    await run('down');

    expect(await findPositionIdIndexedTables()).toEqual([]);

    await run('up', { dryRun: true });

    expect(await findPositionIdIndexedTables()).toEqual([]);

    await run('up');

    expect(await findPositionIdIndexedTables()).toEqual(indexedTables);
  });
});
