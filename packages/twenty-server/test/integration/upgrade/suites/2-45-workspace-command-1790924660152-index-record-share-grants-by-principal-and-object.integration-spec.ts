import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In } from 'typeorm';

import { type IndexRecordShareGrantsByPrincipalAndObjectCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790924660152-index-record-share-grants-by-principal-and-object.command';
import {
  LEGACY_RECORD_SHARE_INDEXES,
  PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-record-share-index-sync-plan-or-throw.util';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const COMPOSITE_INDEX_UNIVERSAL_IDENTIFIER =
  PRINCIPAL_ID_OBJECT_METADATA_ID_INDEX.universalIdentifier;
const LEGACY_INDEX_UNIVERSAL_IDENTIFIERS = LEGACY_RECORD_SHARE_INDEXES.map(
  ({ universalIdentifier }) => universalIdentifier,
);

describe('2-45 workspace command 1790924660152 - IndexRecordShareGrantsByPrincipalAndObjectCommand (integration)', () => {
  let command: IndexRecordShareGrantsByPrincipalAndObjectCommand;
  let workspaceOrmManager: WorkspaceOrmManager;

  const run = (
    direction: 'up' | 'down',
    { dryRun = false }: { dryRun?: boolean } = {},
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command[direction]({
          workspaceId,
          options: { dryRun },
          index: 0,
          total: 1,
        }),
      buildSystemAuthContext(workspaceId),
    );

  const findIndexes = async () => {
    const indexMetadatas = await getCoreRepository<IndexMetadataEntity>(
      IndexMetadataEntity,
    ).find({
      where: {
        workspaceId,
        universalIdentifier: In([
          COMPOSITE_INDEX_UNIVERSAL_IDENTIFIER,
          ...LEGACY_INDEX_UNIVERSAL_IDENTIFIERS,
        ]),
      },
    });
    const physicalIndexes: { indexname: string; indexdef: string }[] =
      await globalThis.testDataSource.query(
        `SELECT indexname, indexdef FROM pg_indexes
         WHERE schemaname = $1 AND indexname = ANY($2::text[])`,
        [
          getWorkspaceSchemaName(workspaceId),
          indexMetadatas.map(({ name }) => name),
        ],
      );

    return indexMetadatas.map(({ universalIdentifier, name }) => ({
      universalIdentifier,
      indexDefinition: physicalIndexes.find(
        ({ indexname }) => indexname === name,
      )?.indexdef,
    }));
  };

  const findPhysicalIndex = async (
    indexName: string,
  ): Promise<{ indexDefinition: string; isValid: boolean } | undefined> => {
    const [physicalIndex] = await globalThis.testDataSource.query(
      `SELECT pg_get_indexdef(pg_index.indexrelid) AS "indexDefinition", pg_index.indisvalid AS "isValid"
       FROM pg_index
       JOIN pg_class ON pg_class.oid = pg_index.indexrelid
       JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
       WHERE pg_namespace.nspname = $1 AND pg_class.relname = $2`,
      [getWorkspaceSchemaName(workspaceId), indexName],
    );

    return physicalIndex;
  };

  const findIndexUniversalIdentifiers = async () =>
    (await findIndexes())
      .map(({ universalIdentifier }) => universalIdentifier)
      .sort();

  beforeAll(() => {
    command =
      getAppProviderByClassName<IndexRecordShareGrantsByPrincipalAndObjectCommand>(
        'IndexRecordShareGrantsByPrincipalAndObjectCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
  });

  afterAll(async () => {
    await run('up');
  });

  it('is registered in the 2.45 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.45.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790924660152 }),
      ]),
    );
  });

  it('restores the principalId and sourceId indexes on the way down', async () => {
    await run('up');
    await run('down');

    const indexes = await findIndexes();

    expect(
      indexes.map(({ universalIdentifier }) => universalIdentifier).sort(),
    ).toEqual([...LEGACY_INDEX_UNIVERSAL_IDENTIFIERS].sort());
    expect(indexes.map(({ indexDefinition }) => indexDefinition)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('("principalId")'),
        expect.stringContaining('("sourceId")'),
      ]),
    );
  });

  it('keeps a workspace on the legacy indexes untouched on a dry run', async () => {
    await run('down');
    await run('up', { dryRun: true });

    expect(await findIndexUniversalIdentifiers()).toEqual(
      [...LEGACY_INDEX_UNIVERSAL_IDENTIFIERS].sort(),
    );
  });

  it('rebuilds an index left invalid by an interrupted concurrent build', async () => {
    await run('up');

    const { name: compositeIndexName } =
      await getCoreRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId,
          universalIdentifier: COMPOSITE_INDEX_UNIVERSAL_IDENTIFIER,
        },
      });
    const schemaName = getWorkspaceSchemaName(workspaceId);

    await run('down');
    await globalThis.testDataSource.query(
      `CREATE INDEX "${compositeIndexName}" ON "${schemaName}"."recordShare" ("principalId")`,
    );
    await globalThis.testDataSource.query(
      `UPDATE pg_index SET indisvalid = false WHERE indexrelid = $1::regclass`,
      [`"${schemaName}"."${compositeIndexName}"`],
    );

    expect(await findPhysicalIndex(compositeIndexName)).toMatchObject({
      isValid: false,
    });

    await run('up');

    expect(await findPhysicalIndex(compositeIndexName)).toEqual({
      isValid: true,
      indexDefinition: expect.stringContaining(
        '("principalId", "objectMetadataId")',
      ),
    });
  });

  it('rebuilds a legacy index left invalid by an interrupted concurrent build on the way down', async () => {
    await run('down');

    const { name: sourceIdIndexName } =
      await getCoreRepository<IndexMetadataEntity>(
        IndexMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId,
          universalIdentifier: LEGACY_INDEX_UNIVERSAL_IDENTIFIERS[1],
        },
      });
    const schemaName = getWorkspaceSchemaName(workspaceId);

    await run('up');
    await globalThis.testDataSource.query(
      `CREATE INDEX "${sourceIdIndexName}" ON "${schemaName}"."recordShare" ("principalId")`,
    );
    await globalThis.testDataSource.query(
      `UPDATE pg_index SET indisvalid = false WHERE indexrelid = $1::regclass`,
      [`"${schemaName}"."${sourceIdIndexName}"`],
    );

    expect(await findPhysicalIndex(sourceIdIndexName)).toMatchObject({
      isValid: false,
    });

    await run('down');

    expect(await findPhysicalIndex(sourceIdIndexName)).toEqual({
      isValid: true,
      indexDefinition: expect.stringContaining('("sourceId")'),
    });
  });

  it('replaces the legacy indexes with a (principalId, objectMetadataId) index, once', async () => {
    await run('down');
    await run('up');
    await run('up');

    expect(await findIndexes()).toEqual([
      {
        universalIdentifier: COMPOSITE_INDEX_UNIVERSAL_IDENTIFIER,
        indexDefinition: expect.stringContaining(
          '("principalId", "objectMetadataId")',
        ),
      },
    ]);
  });
});
