import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FindOtherObjectFieldsFromFlatFieldMetadataMapsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadataSecond>;
  objectMetadataId: string;
};
// Should throw if empty ? TODO DEFINITELY
export const findObjectFieldsInFlatFieldMetadataMaps = ({
  flatFieldMetadataMaps,
  objectMetadataId,
}: FindOtherObjectFieldsFromFlatFieldMetadataMapsArgs) => {
  return Object.values(flatFieldMetadataMaps.byId).reduce<{
    objectFlatFieldMetadataById: Record<string, FlatFieldMetadataSecond>;
    objectFlatFieldMetadatas: FlatFieldMetadataSecond[];
  }>(
    (acc, flatFieldMetadata) => {
      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.objectMetadataId === objectMetadataId
      ) {
        return acc;
      }

      return {
        objectFlatFieldMetadataById: {
          ...acc.objectFlatFieldMetadataById,
          [flatFieldMetadata.id]: flatFieldMetadata,
        },
        objectFlatFieldMetadatas: [
          ...acc.objectFlatFieldMetadatas,
          flatFieldMetadata,
        ],
      };
    },
    {
      objectFlatFieldMetadataById: {},
      objectFlatFieldMetadatas: [],
    },
  );
};
