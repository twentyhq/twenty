import { isDefined } from 'twenty-shared/utils';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas.util';

export const computeMorphOrRelationTargetFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata<MorphOrRelationFieldMetadataType>;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
}): FlatObjectMetadataMaps | undefined => {
  const relationTargetFlatFieldMetadata =
    findRelationFlatFieldMetadataTargetFlatFieldMetadata({
      flatFieldMetadata,
      flatObjectMetadataMaps,
    });

  if (!isDefined(relationTargetFlatFieldMetadata)) {
    return undefined;
  }

  return getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas({
    flatObjectMetadataMaps,
    flatFieldMetadatas: [relationTargetFlatFieldMetadata],
  });
};
