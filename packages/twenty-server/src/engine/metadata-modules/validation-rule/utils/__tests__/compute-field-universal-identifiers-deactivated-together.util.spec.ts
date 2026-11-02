/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeFieldUniversalIdentifiersDeactivatedTogether } from 'src/engine/metadata-modules/validation-rule/utils/compute-field-universal-identifiers-deactivated-together.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const OBJECT_METADATA_ID = 'object-id';

const buildMorphField = (name: string, relationTargetName: string) =>
  getFlatFieldMetadataMock({
    id: `${name}-id`,
    universalIdentifier: name,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.MORPH_RELATION,
    morphId: 'morph-id',
    relationTargetFieldMetadataId: `${relationTargetName}-id`,
    relationTargetFieldMetadataUniversalIdentifier: relationTargetName,
  });

const buildRelationField = (name: string, objectMetadataId: string) =>
  getFlatFieldMetadataMock({
    id: `${name}-id`,
    universalIdentifier: name,
    objectMetadataId,
    type: FieldMetadataType.RELATION,
  });

const compute = (flatFieldMetadata: FlatFieldMetadata) => {
  const fields = [
    buildMorphField('targetRocket', 'owner'),
    buildMorphField('targetPet', 'petOwner'),
    buildRelationField('owner', 'rocket-object-id'),
    buildRelationField('petOwner', 'pet-object-id'),
  ];
  const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
    createEmptyFlatEntityMaps();
  const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> =
    createEmptyFlatEntityMaps();

  for (const field of fields) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: field,
      flatEntityMapsToMutate: flatFieldMetadataMaps,
    });
  }
  addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
    flatEntity: getFlatObjectMetadataMock({
      id: OBJECT_METADATA_ID,
      universalIdentifier: 'object',
      fieldIds: ['targetRocket-id', 'targetPet-id'],
    }),
    flatEntityMapsToMutate: flatObjectMetadataMaps,
  });

  return computeFieldUniversalIdentifiersDeactivatedTogether({
    flatFieldMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });
};

describe('computeFieldUniversalIdentifiersDeactivatedTogether', () => {
  it('should include the other side of a relation', () => {
    expect(
      compute(
        getFlatFieldMetadataMock({
          universalIdentifier: 'people',
          objectMetadataId: OBJECT_METADATA_ID,
          type: FieldMetadataType.RELATION,
          relationTargetFieldMetadataUniversalIdentifier: 'company',
        }),
      ),
    ).toEqual(['people', 'company']);
  });

  it('should include the sibling morph fields and all their other sides', () => {
    const universalIdentifiers = compute(
      buildMorphField('targetRocket', 'owner'),
    );

    expect(new Set(universalIdentifiers)).toEqual(
      new Set(['targetRocket', 'targetPet', 'owner', 'petOwner']),
    );
  });
});
