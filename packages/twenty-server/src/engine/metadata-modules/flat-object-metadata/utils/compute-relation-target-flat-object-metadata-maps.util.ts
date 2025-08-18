import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findRelationFlatFieldMetadataTargetFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-relation-flat-field-metadatas-target-flat-field-metadata.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-sub-flat-object-metadata-maps-out-of-flat-field-metadatas.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeRelationTargetFlatObjectMetadataMaps = ({
  flatFieldMetadata,
  flatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >;
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
