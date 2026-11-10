import { NO_RECORD_READ_RESTRICTIONS } from 'src/engine/permissions/constants/no-record-read-restrictions.constant';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';

const PET_OBJECT_METADATA_ID = 'pet-object-id';

const DISABLED_FEATURE_FLAGS_MAP = Object.values(FeatureFlagKey).reduce<
  Record<string, boolean>
>((featureFlagsMap, featureFlagKey) => {
  featureFlagsMap[featureFlagKey] = false;

  return featureFlagsMap;
}, {});

const buildFlatEntityMaps = <T extends SyncableFlatEntity>(
  flatEntities: T[],
): FlatEntityMaps<T> =>
  flatEntities.reduce<FlatEntityMaps<T>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildFlatFieldMetadataMaps = (weightFieldName: string) =>
  buildFlatEntityMaps<FlatFieldMetadata>([
    getFlatFieldMetadataMock({
      id: 'field-id',
      universalIdentifier: 'field-id',
      objectMetadataId: PET_OBJECT_METADATA_ID,
      type: FieldMetadataType.UUID,
      name: 'id',
    }),
    getFlatFieldMetadataMock({
      id: 'field-weight',
      universalIdentifier: 'field-weight',
      objectMetadataId: PET_OBJECT_METADATA_ID,
      type: FieldMetadataType.NUMBER,
      name: weightFieldName,
    }),
  ]);

const buildFlatObjectMetadataMaps = (nameSingular: string) =>
  buildFlatEntityMaps<FlatObjectMetadata>([
    getFlatObjectMetadataMock({
      id: PET_OBJECT_METADATA_ID,
      universalIdentifier: PET_OBJECT_METADATA_ID,
      nameSingular,
      fieldIds: ['field-id', 'field-weight'],
    }),
  ]);

const buildPool = () => ({
  connect: jest.fn(),
  query: jest.fn().mockResolvedValue({ rows: [{ value: 3 }] }),
});

const sumPetColumn = ({
  pool,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  columnName,
}: {
  pool: ReturnType<typeof buildPool>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  columnName: string;
}) =>
  new WorkspaceDataSource({
    pool,
    internalContext: {
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatIndexMaps: createEmptyFlatEntityMaps(),
      objectIdByNameSingular: { pet: PET_OBJECT_METADATA_ID },
      featureFlagsMap: DISABLED_FEATURE_FLAGS_MAP,
      billingEntitlements: {},
      eventEmitterService: { emitDatabaseBatchEvent: jest.fn() },
      permissionsPrincipals: undefined,
      recordReadRestrictions: NO_RECORD_READ_RESTRICTIONS,
      recordPermissions: {} as WorkspaceInternalContext['recordPermissions'],
      recordPermissionsOnlyRls: {
        findRlsRuleUnreadableFieldsByRole: jest.fn(),
        buildRlsRuleSqlConditionOrThrow: jest.fn(),
      },
      recordAccessGroupWrite: {
        isWriteTransactionRequired: jest.fn().mockResolvedValue(false),
        isRecordsBeforeWriteRequired: jest.fn().mockResolvedValue(false),
        findRelatedRecordsBeforeDelete: jest.fn().mockResolvedValue([]),
        recomputeAfterWrite: jest.fn().mockResolvedValue([]),
      },
      recordAccessGroupQueue: { queueRecompute: jest.fn() },
      recordStock: {
        assertRecordStockAvailable: jest.fn(),
        acquireRecordStock: jest.fn(),
        releaseRecordStock: jest.fn(),
      },
      coreDataSource: new DataSource({ type: 'postgres' }),
    },
    authContext: {} as WorkspaceAuthContext,
  })
    .getRepositoryWithoutPermissionChecks('pet')
    .sum(columnName);

const expectSingleQueryContaining = ({
  pool,
  sqlFragment,
}: {
  pool: ReturnType<typeof buildPool>;
  sqlFragment: string;
}) => {
  expect(pool.query).toHaveBeenCalledTimes(1);
  expect(pool.query).toHaveBeenCalledWith(
    expect.objectContaining({ text: expect.stringContaining(sqlFragment) }),
  );
  pool.query.mockClear();
};

describe('WorkspaceDataSource', () => {
  it('should read a renamed field when only the field metadata maps changed', async () => {
    const pool = buildPool();
    const flatObjectMetadataMaps = buildFlatObjectMetadataMaps('pet');

    await sumPetColumn({
      pool,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps('weight'),
      columnName: 'weight',
    });
    expectSingleQueryContaining({ pool, sqlFragment: '"weight"' });

    const renamedSum = await sumPetColumn({
      pool,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps('weightInKg'),
      columnName: 'weightInKg',
    });

    expectSingleQueryContaining({ pool, sqlFragment: '"weightInKg"' });
    expect(renamedSum).toBe(3);
  });

  it('should target the renamed table when only the object metadata maps changed', async () => {
    const pool = buildPool();
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps('weight');

    await sumPetColumn({
      pool,
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps('pet'),
      flatFieldMetadataMaps,
      columnName: 'weight',
    });
    expectSingleQueryContaining({ pool, sqlFragment: '"_pet"' });

    await sumPetColumn({
      pool,
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps('animal'),
      flatFieldMetadataMaps,
      columnName: 'weight',
    });
    expectSingleQueryContaining({ pool, sqlFragment: '"_animal"' });
  });
});
