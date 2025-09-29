import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isDefined } from 'twenty-shared/utils';

type FindOtherObjectFieldsFromFlatFieldMetadataMapsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadataSecond>;
  objectMetadataId: string;
};
export const findOtherObjectFieldsFromFlatFieldMetadataMapsUtil = ({
  flatFieldMetadataMaps,
  objectMetadataId,
}: FindOtherObjectFieldsFromFlatFieldMetadataMapsArgs) => {
  return Object.values(flatFieldMetadataMaps.byId).reduce<{
    flatFieldMetadataById: Record<string, FlatFieldMetadataSecond>;
    allObjectFlatFieldMetadatas: FlatFieldMetadataSecond[];
  }>(
    (acc, flatFieldMetadata) => {
      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.objectMetadataId === objectMetadataId
      ) {
        return acc;
      }

      return {
        flatFieldMetadataById: {
          ...acc.flatFieldMetadataById,
          [flatFieldMetadata.id]: flatFieldMetadata,
        },
        allObjectFlatFieldMetadatas: [
          ...acc.allObjectFlatFieldMetadatas,
          flatFieldMetadata,
        ],
      };
    },
    {
      flatFieldMetadataById: {},
      allObjectFlatFieldMetadatas: [],
    },
  );
};
