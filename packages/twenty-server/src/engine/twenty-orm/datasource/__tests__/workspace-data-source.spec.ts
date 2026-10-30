import { type Pool } from 'pg';
import { FieldMetadataType } from 'twenty-shared/types';

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
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

const PET_OBJECT_METADATA_ID = 'pet-object-id';

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

const buildPool = () =>
  ({
    query: jest.fn().mockResolvedValue({ rows: [{ value: 3 }] }),
  }) as unknown as Pool;

const sumPetColumn = ({
  pool,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  columnName,
}: {
  pool: Pool;
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
      objectIdByNameSingular: { pet: PET_OBJECT_METADATA_ID },
      featureFlagsMap: {},
    } as unknown as WorkspaceInternalContext,
    authContext: {} as WorkspaceAuthContext,
    objectPermissionsByRoleId: {},
  })
    .getRepository('pet', { shouldBypassPermissionChecks: true })
    .sum(columnName);

const expectSingleQueryContaining = (pool: Pool, sqlFragment: string) => {
  expect(pool.query).toHaveBeenCalledTimes(1);
  expect(pool.query).toHaveBeenCalledWith(
    expect.objectContaining({ text: expect.stringContaining(sqlFragment) }),
  );
  jest.mocked(pool.query).mockClear();
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
    expectSingleQueryContaining(pool, '"weight"');

    const renamedSum = await sumPetColumn({
      pool,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps('weightInKg'),
      columnName: 'weightInKg',
    });

    expectSingleQueryContaining(pool, '"weightInKg"');
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
    expectSingleQueryContaining(pool, '"_pet"');

    await sumPetColumn({
      pool,
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps('animal'),
      flatFieldMetadataMaps,
      columnName: 'weight',
    });
    expectSingleQueryContaining(pool, '"_animal"');
  });
});
