import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isDefined } from 'twenty-shared/utils';

type FindOtherObjectFieldsFromFlatFieldMetadataMapsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadataSecond>;
  objectMetadataId: string;
};
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
