import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getIndexUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type ExcludeDeletedRecordsFromUniqueFieldIndexesCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-workspace-command-1794498818636-exclude-deleted-records-from-unique-field-indexes.command';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const CUSTOM_OBJECT_NAME_SINGULAR = 'uniqueIndexUpgradeObject';
const CUSTOM_OBJECT_TABLE_NAME = `_${CUSTOM_OBJECT_NAME_SINGULAR}`;

type IndexMetadataRow = {
  id: string;
  name: string;
  universalIdentifier: string;
  indexWhereClause: string | null;
};

type UniqueField = {
  objectNameSingular: string;
  fieldName: string;
  tableName: string;
  columnName: string;
};

const PERSON_EMAILS: UniqueField = {
  objectNameSingular: 'person',
  fieldName: 'emails',
  tableName: 'person',
  columnName: 'emailsPrimaryEmail',
};

const CUSTOM_REFERENCE: UniqueField = {
  objectNameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
  fieldName: 'reference',
  tableName: CUSTOM_OBJECT_TABLE_NAME,
  columnName: 'reference',
};

describe('2-59 workspace command - exclude deleted records from unique field indexes (integration)', () => {
  let command: ExcludeDeletedRecordsFromUniqueFieldIndexesCommand;
  let customObjectMetadataId: string;
  let customFieldMetadataId: string;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findUniqueFieldIndexMetadatas = ({
    objectNameSingular,
    fieldName,
  }: Pick<UniqueField, 'objectNameSingular' | 'fieldName'>): Promise<
    IndexMetadataRow[]
  > =>
    global.testDataSource.query(
      `SELECT "indexMetadata".id, "indexMetadata".name,
              "indexMetadata"."universalIdentifier", "indexMetadata"."indexWhereClause"
         FROM core."indexMetadata" "indexMetadata"
         JOIN core."objectMetadata" "objectMetadata"
           ON "objectMetadata".id = "indexMetadata"."objectMetadataId"
         JOIN core."indexFieldMetadata" "indexFieldMetadata"
           ON "indexFieldMetadata"."indexMetadataId" = "indexMetadata".id
         JOIN core."fieldMetadata" "fieldMetadata"
           ON "fieldMetadata".id = "indexFieldMetadata"."fieldMetadataId"
        WHERE "indexMetadata"."workspaceId" = $1
          AND "indexMetadata"."isUnique" = true
          AND "objectMetadata"."nameSingular" = $2
          AND "fieldMetadata".name = $3`,
      [SEED_APPLE_WORKSPACE_ID, objectNameSingular, fieldName],
    );

  const findPhysicalIndexDefinition = async (
    indexName: string,
  ): Promise<string | undefined> => {
    const [index] = await global.testDataSource.query(
      `SELECT indexdef AS definition FROM pg_indexes
        WHERE schemaname = $1 AND indexname = $2`,
      [SCHEMA, indexName],
    );

    return index?.definition;
  };

  const recomputeIndexCache = () =>
    getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      ...new Set(
        ['index' as const, ...getMetadataRelatedMetadataNames('index')].map(
          getMetadataFlatEntityMapsKey,
        ),
      ),
    ]);

  const turnUniqueFieldIndexIntoLegacyIndex = async (
    uniqueField: UniqueField,
  ): Promise<{
    currentIndexMetadata: IndexMetadataRow;
    legacyIndexName: string;
  }> => {
    const [currentIndexMetadata] =
      await findUniqueFieldIndexMetadatas(uniqueField);
    const legacyIndexName = `IDX_UNIQUE_legacy_${uniqueField.fieldName}`;

    await global.testDataSource.query(
      `DROP INDEX "${SCHEMA}"."${currentIndexMetadata.name}"`,
    );
    await global.testDataSource.query(
      `CREATE UNIQUE INDEX "${legacyIndexName}" ON "${SCHEMA}"."${uniqueField.tableName}" ("${uniqueField.columnName}")`,
    );
    const [{ applicationUniversalIdentifier, objectUniversalIdentifier }] =
      await global.testDataSource.query(
        `SELECT "application"."universalIdentifier" AS "applicationUniversalIdentifier",
                "objectMetadata"."universalIdentifier" AS "objectUniversalIdentifier"
           FROM core."fieldMetadata" "fieldMetadata"
           JOIN core."objectMetadata" "objectMetadata"
             ON "objectMetadata".id = "fieldMetadata"."objectMetadataId"
           JOIN core."application" "application"
             ON "application".id = "fieldMetadata"."applicationId"
          WHERE "fieldMetadata"."workspaceId" = $1
            AND "objectMetadata"."nameSingular" = $2
            AND "fieldMetadata".name = $3`,
        [
          SEED_APPLE_WORKSPACE_ID,
          uniqueField.objectNameSingular,
          uniqueField.fieldName,
        ],
      );

    await global.testDataSource.query(
      `UPDATE core."indexMetadata"
          SET name = $1, "universalIdentifier" = $2, "indexWhereClause" = NULL
        WHERE id = $3`,
      [
        legacyIndexName,
        getIndexUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: legacyIndexName,
        }),
        currentIndexMetadata.id,
      ],
    );
    await recomputeIndexCache();

    return { currentIndexMetadata, legacyIndexName };
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<ExcludeDeletedRecordsFromUniqueFieldIndexesCommand>(
        'ExcludeDeletedRecordsFromUniqueFieldIndexesCommand',
      );

    const { data: objectData } = await createOneObjectMetadata({
      input: {
        nameSingular: CUSTOM_OBJECT_NAME_SINGULAR,
        namePlural: `${CUSTOM_OBJECT_NAME_SINGULAR}s`,
        labelSingular: 'Unique Index Upgrade Object',
        labelPlural: 'Unique Index Upgrade Objects',
        icon: 'IconTestPipe',
        isLabelSyncedWithName: false,
      },
    });

    customObjectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      input: {
        name: CUSTOM_REFERENCE.fieldName,
        label: 'Reference',
        type: FieldMetadataType.TEXT,
        objectMetadataId: customObjectMetadataId,
        isUnique: true,
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });

    customFieldMetadataId = fieldData.createOneField.id;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: customObjectMetadataId },
    });
  });

  it.each([
    { title: 'a standard unique field', uniqueField: PERSON_EMAILS },
    { title: 'a custom unique field', uniqueField: CUSTOM_REFERENCE },
  ])(
    'rebuilds the legacy index of $title as an index on non-deleted records',
    async ({ uniqueField }) => {
      const { currentIndexMetadata, legacyIndexName } =
        await turnUniqueFieldIndexIntoLegacyIndex(uniqueField);

      expect(currentIndexMetadata.indexWhereClause).toBe('"deletedAt" IS NULL');

      await runOnWorkspace({ dryRun: true });

      expect(await findPhysicalIndexDefinition(legacyIndexName)).toBeDefined();
      expect(
        await findPhysicalIndexDefinition(currentIndexMetadata.name),
      ).toBeUndefined();

      await runOnWorkspace();
      await runOnWorkspace();

      expect(
        await findPhysicalIndexDefinition(legacyIndexName),
      ).toBeUndefined();
      expect(
        await findPhysicalIndexDefinition(currentIndexMetadata.name),
      ).toContain('WHERE ("deletedAt" IS NULL)');
      expect(await findUniqueFieldIndexMetadatas(uniqueField)).toEqual([
        {
          id: expect.any(String),
          name: currentIndexMetadata.name,
          universalIdentifier: currentIndexMetadata.universalIdentifier,
          indexWhereClause: '"deletedAt" IS NULL',
        },
      ]);
    },
  );

  it('leaves unique indexes that are not owned by a unique field untouched', async () => {
    await runOnWorkspace();

    const [groupHashIndexMetadata] = await findUniqueFieldIndexMetadatas({
      objectNameSingular: 'accessGroup',
      fieldName: 'groupHash',
    });

    expect(groupHashIndexMetadata.indexWhereClause).toBeNull();
    expect(
      await findPhysicalIndexDefinition(groupHashIndexMetadata.name),
    ).not.toContain('WHERE');
  });

  it('lets a field with a legacy index stop being unique before the command runs', async () => {
    const { legacyIndexName } =
      await turnUniqueFieldIndexIntoLegacyIndex(CUSTOM_REFERENCE);

    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: customFieldMetadataId,
        updatePayload: { isUnique: false },
      },
      gqlFields: 'id isUnique',
    });

    expect(await findPhysicalIndexDefinition(legacyIndexName)).toBeUndefined();
    expect(await findUniqueFieldIndexMetadatas(CUSTOM_REFERENCE)).toEqual([]);
  });
});
