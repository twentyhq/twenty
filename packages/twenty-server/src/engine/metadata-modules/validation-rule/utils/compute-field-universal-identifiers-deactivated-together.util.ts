/* @license Enterprise */

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFlatFieldMetadatasRelatedToMorphRelationOrThrow } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadatas-related-to-morph-relation-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeFieldUniversalIdentifiersDeactivatedTogether = ({
  flatFieldMetadata,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): string[] => {
  const directUniversalIdentifiers = [
    flatFieldMetadata.universalIdentifier,
    flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
  ].filter(isDefined);

  if (
    !isFlatFieldMetadataOfType(
      flatFieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    return directUniversalIdentifiers;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatFieldMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    return directUniversalIdentifiers;
  }

  const { morphRelationFlatFieldMetadatas, relationFlatFieldMetadatas } =
    findFlatFieldMetadatasRelatedToMorphRelationOrThrow({
      flatFieldMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadata,
    });

  return [
    ...directUniversalIdentifiers,
    ...[...morphRelationFlatFieldMetadatas, ...relationFlatFieldMetadatas].map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  ];
};
