import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: '0d4fcb0b-6b6c-4f3a-9a8e-1f2f3c4d5e6f',
  universalIdentifier: 'object-universal-identifier',
});

const flatEntityMaps: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();

addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
  flatEntity: flatObjectMetadata,
  flatEntityMapsToMutate: flatEntityMaps,
});

describe('findFlatEntityByIdInFlatEntityMapsOrThrow', () => {
  it('should find a flat entity by its canonical id', () => {
    expect(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatObjectMetadata.id,
        flatEntityMaps,
      }),
    ).toBe(flatObjectMetadata);
  });

  it('should find a flat entity by its uppercased id', () => {
    expect(
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: flatObjectMetadata.id.toUpperCase(),
        flatEntityMaps,
      }),
    ).toBe(flatObjectMetadata);
  });

  it('should throw for an unknown id', () => {
    expect(() =>
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: '11111111-1111-4111-8111-111111111111',
        flatEntityMaps,
      }),
    ).toThrow();
  });
});
