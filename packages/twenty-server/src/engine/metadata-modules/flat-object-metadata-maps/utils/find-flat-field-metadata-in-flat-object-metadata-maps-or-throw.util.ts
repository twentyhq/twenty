import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import {
  findFlatFieldMetadataInFlatObjectMetadataMaps,
  type FindFlatFieldMetadataInFlatObjectMetadataMapsArgs,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps.util';

export const findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
  objectMetadataId,
}: FindFlatFieldMetadataInFlatObjectMetadataMapsArgs): FlatFieldMetadata => {
  const flatFieldMetadata = findFlatFieldMetadataInFlatObjectMetadataMaps({
    flatObjectMetadataMaps,
    fieldMetadataId,
    objectMetadataId,
  });

  if (!isDefined(flatFieldMetadata)) {
    throw new FlatObjectMetadataMapsException(
      'flat field metadata not found in flat object metadata maps',
      FlatObjectMetadataMapsExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  return flatFieldMetadata;
};
