import { isDefined } from 'twenty-shared/utils';

import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-with-field-maps-to-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps-or-throw.util';

export type GetSubFlatObjectMetadataMapsOrThrowArgs = {
  objectMetadataAndFieldIds: {
    objectMetadataId: string;
    fieldMetadataIds?: string[];
  }[];
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const getSubFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps: sourceFlatObjectMetadataMaps,
  objectMetadataAndFieldIds,
}: GetSubFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  return objectMetadataAndFieldIds.reduce(
    (flatObjectMetadataMaps, { objectMetadataId, fieldMetadataIds }) => {
      let flatObjectMetadataWithFlatFieldMaps = structuredClone(
        sourceFlatObjectMetadataMaps.byId[objectMetadataId],
      );

      if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
        throw new FlatObjectMetadataMapsException(
          'getSubFlatObjectMetadataMapsOrThrow object metadata not found',
          FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      if (isDefined(fieldMetadataIds)) {
        flatObjectMetadataWithFlatFieldMaps =
          flatObjectMetadataWithFlatFieldMaps.flatFieldMetadatas.reduce(
            (flatObjectMetadataWithFlatFieldMaps, flatFieldMetadata) => {
              if (fieldMetadataIds.includes(flatFieldMetadata.id)) {
                return flatObjectMetadataWithFlatFieldMaps;
              }

              return deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow({
                fieldMetadataId: flatFieldMetadata.id,
                flatObjectMetadataWithFlatFieldMaps,
              });
            },
            flatObjectMetadataWithFlatFieldMaps,
          );
      }

      return addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow(
        {
          flatObjectMetadataMaps,
          flatObjectMetadataWithFlatFieldMaps,
        },
      );
    },
    EMPTY_FLAT_OBJECT_METADATA_MAPS,
  );
};
