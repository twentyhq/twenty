import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { findLegacyMorphRelationRepresentative } from 'src/engine/metadata-modules/morph-relation-head/utils/find-legacy-morph-relation-representative.util';

type MorphRelationField = FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

export const computeMorphRelationReferenceDestinations = ({
  isMorphRelationHeadEnabled,
  flatFieldMetadataMaps,
}: {
  isMorphRelationHeadEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  destinationFieldByOriginFieldId: Map<string, FlatFieldMetadata>;
  morphIdsWithoutHead: string[];
} => {
  const morphRelationFieldsByMorphId = new Map<string, MorphRelationField[]>();

  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(field) &&
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)
    ) {
      morphRelationFieldsByMorphId.set(field.morphId, [
        ...(morphRelationFieldsByMorphId.get(field.morphId) ?? []),
        field,
      ]);
    }
  }

  const destinationFieldByOriginFieldId = new Map<string, FlatFieldMetadata>();
  const morphIdsWithoutHead: string[] = [];

  for (const morphRelationFields of morphRelationFieldsByMorphId.values()) {
    const head: MorphRelationField | undefined =
      morphRelationFields.find(isMorphRelationHead);
    const representative = findLegacyMorphRelationRepresentative(
      morphRelationFields.filter((field) => !isMorphRelationHead(field)),
    );

    if (!isDefined(representative)) {
      continue;
    }

    if (!isDefined(head)) {
      morphIdsWithoutHead.push(representative.morphId);
      continue;
    }

    if (isMorphRelationHeadEnabled) {
      destinationFieldByOriginFieldId.set(representative.id, head);
    } else {
      destinationFieldByOriginFieldId.set(head.id, representative);
    }
  }

  return { destinationFieldByOriginFieldId, morphIdsWithoutHead };
};
