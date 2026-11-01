import { randomUUID } from 'node:crypto';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type SyncAccessGroupObjectCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793384492383-sync-access-group-object.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const ACCESS_GROUP = STANDARD_OBJECTS.accessGroup;

describe('2-55 workspace command - sync access group object (integration)', () => {
  let command: SyncAccessGroupObjectCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findAccessGroupStorage = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const tables: { table_name: string }[] = await global.testDataSource.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'accessGroup'`,
      [SCHEMA],
    );

    return {
      flatObjectMetadata:
        flatObjectMetadataMaps.byUniversalIdentifier[
          ACCESS_GROUP.universalIdentifier
        ],
      flatFieldMetadatas: Object.values(ACCESS_GROUP.fields)
        .map(
          ({ universalIdentifier }) =>
            flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier],
        )
        .filter(isDefined),
      flatIndexMetadatas: Object.values(ACCESS_GROUP.indexes)
        .map(
          ({ universalIdentifier }) =>
            flatIndexMaps.byUniversalIdentifier[universalIdentifier],
        )
        .filter(isDefined),
      hasTable: tables.length === 1,
    };
  };

  const insertAccessGroup = ({
    roleId,
    groupHash,
  }: {
    roleId: string;
    groupHash: string;
  }) =>
    global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."accessGroup" ("roleId", "groupHash")
       VALUES ($1, $2)`,
      [roleId, groupHash],
    );

  beforeAll(async () => {
    command = getAppProviderByClassName<SyncAccessGroupObjectCommand>(
      'SyncAccessGroupObjectCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const { flatObjectMetadata, flatFieldMetadatas, flatIndexMetadatas } =
      await findAccessGroupStorage();

    const result =
      await getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      ).validateBuildAndRunLegacyWorkspaceMigration({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        isSystemBuild: true,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [flatObjectMetadata].filter(isDefined),
            flatEntityToUpdate: [],
          },
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatFieldMetadatas,
            flatEntityToUpdate: [],
          },
          index: {
            flatEntityToCreate: [],
            flatEntityToDelete: flatIndexMetadatas,
            flatEntityToUpdate: [],
          },
        },
      });

    expect(result.status).toBe('success');
  });

  afterAll(async () => {
    await runOnWorkspace();
  });

  it('leaves the object absent on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    expect(await findAccessGroupStorage()).toMatchObject({
      flatObjectMetadata: undefined,
      flatFieldMetadatas: [],
      flatIndexMetadatas: [],
      hasTable: false,
    });
  });

  it('creates the object, its fields, indexes and table once', async () => {
    await runOnWorkspace();
    await runOnWorkspace();

    const storage = await findAccessGroupStorage();

    expect(storage.flatObjectMetadata).toMatchObject({
      nameSingular: 'accessGroup',
      isSystem: true,
    });
    expect(storage.flatFieldMetadatas).toHaveLength(
      Object.keys(ACCESS_GROUP.fields).length,
    );
    expect(storage.flatIndexMetadatas).toHaveLength(
      Object.keys(ACCESS_GROUP.indexes).length,
    );
    expect(storage.hasTable).toBe(true);
  });

  it('refuses a second group with the same group hash', async () => {
    const roleId = randomUUID();
    const groupHash = `${roleId}:${randomUUID()}`;

    try {
      await insertAccessGroup({ roleId, groupHash });
      await insertAccessGroup({
        roleId,
        groupHash: `${roleId}:whole-object`,
      });
      await expect(insertAccessGroup({ roleId, groupHash })).rejects.toThrow(
        /duplicate key/,
      );
    } finally {
      await global.testDataSource.query(
        `DELETE FROM "${SCHEMA}"."accessGroup" WHERE "roleId" = $1`,
        [roleId],
      );
    }
  });
});
