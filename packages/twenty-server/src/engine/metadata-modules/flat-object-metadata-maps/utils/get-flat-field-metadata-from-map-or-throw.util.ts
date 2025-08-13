import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { getFlatObjectMetadataFromMapOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-flat-object-metadata-from-map-or-throw.util';

export const getFlatFieldMetadataFromMapOrThrow = (
  flatObjectMetadataMaps: FlatObjectMetadataMaps,
  objectMetadataId: string,
  fieldMetadataId: string,
): FlatFieldMetadata => {
  const flatObjectMetadata = getFlatObjectMetadataFromMapOrThrow(
    flatObjectMetadataMaps,
    objectMetadataId,
  );

  const flatFieldMetadata = flatObjectMetadata.fieldsById[fieldMetadataId];

  if (!flatFieldMetadata) {
    throw new FlatObjectMetadataMapsException(
      'getFlatFieldMetadataFromMapOrThrow field metadata not found',
      FlatObjectMetadataMapsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return flatFieldMetadata;
};
