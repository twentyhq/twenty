import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { EMPTY_FLAT_OBJECT_METADATA_MAPS } from 'src/engine/metadata-modules/flat-object-metadata-maps/constant/empty-flat-object-metadata-maps.constant';
import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/add-flat-object-metadata-with-field-maps-to-flat-object-metadata-maps-or-throw.util';
import { deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/delete-field-from-flat-object-metadata-with-flat-field-maps-or-throw.util';

export type GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs = {
  flatFieldMetadatas: Pick<FlatFieldMetadata, 'objectMetadataId' | 'id'>[];
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const getSubFlatObjectMetadataMapsOutOfFlatFieldMetadatasOrThrow = ({
  flatObjectMetadataMaps: sourceFlatObjectMetadataMaps,
  flatFieldMetadatas,
}: GetSubFlatObjectMetadataMapsOfSpecificFieldsOrThrowArgs): FlatObjectMetadataMaps => {
  const fieldIdPerObjectId = fromArrayToValuesByKeyRecord({
    array: flatFieldMetadatas,
    key: 'objectMetadataId',
  });

  return Object.keys(fieldIdPerObjectId).reduce(
    (flatObjectMetadataMaps, objectMetadataId) => {
      let flatObjectMetadataWithFlatFieldMaps = structuredClone(
        sourceFlatObjectMetadataMaps.byId[objectMetadataId],
      );

      if (!isDefined(flatObjectMetadataWithFlatFieldMaps)) {
        throw new FlatObjectMetadataMapsException(
          'getSubFlatObjectMetadataMapsOfSpecificFieldsOrThrow object metadata not found',
          FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const fieldIds =
        fieldIdPerObjectId[objectMetadataId]?.map(({ id }) => id) ?? [];

      flatObjectMetadataWithFlatFieldMaps =
        flatObjectMetadataWithFlatFieldMaps.flatFieldMetadatas.reduce(
          (flatObjectMetadataWithFlatFieldMaps, flatFieldMetadata) => {
            if (fieldIds.includes(flatFieldMetadata.id)) {
              return flatObjectMetadataWithFlatFieldMaps;
            }

            return deleteFieldFromFlatObjectMetadataWithFlatFieldMapsOrThrow({
              fieldMetadataId: flatFieldMetadata.id,
              flatObjectMetadataWithFlatFieldMaps,
            });
          },
          flatObjectMetadataWithFlatFieldMaps,
        );

      return addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow(
        {
          flatObjectMetadataWithFlatFieldMaps,
          flatObjectMetadataMaps,
        },
      );
    },
    EMPTY_FLAT_OBJECT_METADATA_MAPS,
  );
};
