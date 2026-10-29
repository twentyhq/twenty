import { type Pool } from 'pg';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

const buildFlatEntityMaps = <T extends SyncableFlatEntity>(
  flatEntities: T[],
): FlatEntityMaps<T> =>
  ({
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [flatEntity.id, flatEntity.id]),
    ),
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [flatEntity.id, flatEntity]),
    ),
  }) as unknown as FlatEntityMaps<T>;

const buildFlatFieldMetadataMaps = (weightFieldName: string) =>
  buildFlatEntityMaps([
    { id: 'field-id', name: 'id', type: FieldMetadataType.UUID },
    {
      id: 'field-weight',
      name: weightFieldName,
      type: FieldMetadataType.NUMBER,
    },
  ] as unknown as OrmFlatFieldMetadata[]);

const buildFlatObjectMetadataMaps = (nameSingular: string) =>
  buildFlatEntityMaps([
    {
      id: 'pet-object-id',
      nameSingular,
      applicationUniversalIdentifier: 'a-custom-application',
      fieldIds: ['field-id', 'field-weight'],
    } as unknown as FlatObjectMetadata,
  ]);

const buildDataSource = ({
  pool,
  flatObjectMetadataMaps = buildFlatObjectMetadataMaps('pet'),
  flatFieldMetadataMaps,
}: {
  pool: Pool;
  flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}) =>
  new WorkspaceDataSource({
    pool,
    internalContext: {
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: { pet: 'pet-object-id' },
      featureFlagsMap: {},
    } as unknown as WorkspaceInternalContext,
    authContext: {} as WorkspaceAuthContext,
    objectPermissionsByRoleId: {},
  });

describe('WorkspaceDataSource', () => {
  it('should read a renamed field when only the field metadata maps changed', async () => {
    const pool = {
      query: jest.fn().mockResolvedValue({ rows: [{ value: 3 }] }),
    } as unknown as Pool;

    await buildDataSource({
      pool,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps('weight'),
    })
      .getRepository('pet', { shouldBypassPermissionChecks: true })
      .sum('weight');

    const renamedSum = await buildDataSource({
      pool,
      flatFieldMetadataMaps: buildFlatFieldMetadataMaps('weightInKg'),
    })
      .getRepository('pet', { shouldBypassPermissionChecks: true })
      .sum('weightInKg');

    expect(renamedSum).toBe(3);
  });

  it('should target the renamed table when only the object metadata maps changed', async () => {
    const pool = {
      query: jest.fn().mockResolvedValue({ rows: [{ value: 3 }] }),
    } as unknown as Pool;
    const flatFieldMetadataMaps = buildFlatFieldMetadataMaps('weight');

    await buildDataSource({ pool, flatFieldMetadataMaps })
      .getRepository('pet', { shouldBypassPermissionChecks: true })
      .sum('weight');

    await buildDataSource({
      pool,
      flatObjectMetadataMaps: buildFlatObjectMetadataMaps('animal'),
      flatFieldMetadataMaps,
    })
      .getRepository('pet', { shouldBypassPermissionChecks: true })
      .sum('weight');

    expect(jest.mocked(pool.query).mock.lastCall?.[0]).toMatchObject({
      text: expect.stringContaining('"_animal"'),
    });
  });
});
