import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddPositionIdIndexesCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790867830150-add-position-id-indexes.command';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const schemaName = getWorkspaceSchemaName(workspaceId);

describe('2-45 workspace command 1790867830150 - AddPositionIdIndexesCommand (integration)', () => {
  let command: AddPositionIdIndexesCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let customObjectMetadataId: string | undefined;

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

    if (customObjectMetadataId !== undefined) {
      await updateOneObjectMetadata({
        input: {
          idToUpdate: customObjectMetadataId,
          updatePayload: { isActive: false },
        },
        expectToFail: false,
      });
      await deleteOneObjectMetadata({
        input: { idToDelete: customObjectMetadataId },
      });
    }
  });

  it('is registered in the 2.45 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.45.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790867830150 }),
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

  it('indexes a new custom object', async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: 'positionIndexedPet',
        namePlural: 'positionIndexedPets',
        labelSingular: 'Position indexed pet',
        labelPlural: 'Position indexed pets',
        icon: 'IconPaw',
        isLabelSyncedWithName: false,
      },
    });

    customObjectMetadataId = data.createOneObject.id;

    expect(await findPositionIdIndexedTables()).toContain(
      '_positionIndexedPet',
    );
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
