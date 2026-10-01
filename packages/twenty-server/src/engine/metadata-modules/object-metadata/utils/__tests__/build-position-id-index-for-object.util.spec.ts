import { IndexType } from 'twenty-shared/types';

import { buildPositionIdIndexForObject } from 'src/engine/metadata-modules/object-metadata/utils/build-position-id-index-for-object.util';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const NOW = '2026-10-01T12:00:00.000Z';

const flatObjectMetadata = {
  universalIdentifier: '20202020-1111-4111-8111-111111111111',
  applicationUniversalIdentifier: '20202020-2222-4222-8222-222222222222',
  nameSingular: 'pet',
  isRemote: false,
  isSystem: false,
} as UniversalFlatObjectMetadata;

const systemFlatFieldMetadatas = Object.values(
  buildReservedSystemFlatFieldMetadatasForCustomObject({ flatObjectMetadata }),
);

const fieldUniversalIdentifierByName = new Map(
  systemFlatFieldMetadatas.map(({ name, universalIdentifier }) => [
    name,
    universalIdentifier,
  ]),
);

describe('buildPositionIdIndexForObject', () => {
  it('indexes position then id', () => {
    const index = buildPositionIdIndexForObject({
      flatObjectMetadata,
      objectFlatFieldMetadatas: systemFlatFieldMetadatas,
      now: NOW,
    });

    expect(index).toMatchObject({
      indexType: IndexType.BTREE,
      isUnique: false,
      indexWhereClause: null,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      applicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
    });
    expect(
      index?.universalFlatIndexFieldMetadatas.map(
        ({ fieldMetadataUniversalIdentifier, order }) => [
          fieldMetadataUniversalIdentifier,
          order,
        ],
      ),
    ).toEqual([
      [fieldUniversalIdentifierByName.get('position'), 0],
      [fieldUniversalIdentifierByName.get('id'), 1],
    ]);
  });

  it('gives the same identity every time, so a backfill finds what creation made', () => {
    const build = () =>
      buildPositionIdIndexForObject({
        flatObjectMetadata,
        objectFlatFieldMetadatas: systemFlatFieldMetadatas,
        now: NOW,
      });

    expect(build()?.universalIdentifier).toBe(build()?.universalIdentifier);
    expect(build()?.name).toBe(build()?.name);
  });

  it.each([
    ['a system object', { isSystem: true }],
    ['a remote object', { isRemote: true }],
  ])('skips %s', (_, overrides) => {
    expect(
      buildPositionIdIndexForObject({
        flatObjectMetadata: { ...flatObjectMetadata, ...overrides },
        objectFlatFieldMetadatas: systemFlatFieldMetadatas,
        now: NOW,
      }),
    ).toBeUndefined();
  });

  it('skips an object without a position field', () => {
    expect(
      buildPositionIdIndexForObject({
        flatObjectMetadata,
        objectFlatFieldMetadatas: systemFlatFieldMetadatas.filter(
          ({ name }) => name !== 'position',
        ),
        now: NOW,
      }),
    ).toBeUndefined();
  });
});
