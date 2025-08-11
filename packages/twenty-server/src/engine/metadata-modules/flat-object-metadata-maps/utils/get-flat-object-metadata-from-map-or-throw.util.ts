import { FlatObjectMetadataMapsException, FlatObjectMetadataMapsExceptionCode } from "src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception";
import { type FlatObjectMetadataMaps } from "src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type";
import { type FlatObjectMetadataWithFlatFieldMaps } from "src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type";

export const getFlatObjectMetadataFromMapOrThrow = (
  flatObjectMetadataMaps: FlatObjectMetadataMaps,
  objectMetadataId: string,
): FlatObjectMetadataWithFlatFieldMaps => {
  const flatObjectMetadata = flatObjectMetadataMaps.byId[objectMetadataId];

  if (!flatObjectMetadata) {
    throw new FlatObjectMetadataMapsException(
      'getFlatObjectMetadataFromMapOrThrow object metadata not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  return flatObjectMetadata;
};