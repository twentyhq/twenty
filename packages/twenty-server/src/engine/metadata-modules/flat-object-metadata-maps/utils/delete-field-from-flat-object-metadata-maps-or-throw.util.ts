import { isDefined } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps-or-throw.util';

type DeleteFieldFromFlatObjectMetadataMapsOrThrowArgs = {
  fieldMetadataId: string;
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const deleteFieldFromFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps,
  fieldMetadataId,
  objectMetadataId,
}: DeleteFieldFromFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  const flatObjectMetadataWithFlatFieldMaps =
    flatObjectMetadataMaps.byId[objectMetadataId];

  if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
    throw new FlatObjectMetadataMapsException(
      'deleteFieldFromFlatObjectMetadataMapsOrThrow: field metadata to delete parent flat object metadata not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  return {
    byId: {
      ...flatObjectMetadataMaps.byId,
      [objectMetadataId]:
        deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow({
          fieldMetadataId,
          flatObjectMetadataWithFlatFieldMaps,
        }),
    },
    idByNameSingular: flatObjectMetadataMaps.idByNameSingular,
  };
};
