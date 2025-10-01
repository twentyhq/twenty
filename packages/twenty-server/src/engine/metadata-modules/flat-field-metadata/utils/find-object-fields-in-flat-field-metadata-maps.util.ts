import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type FindObjectFieldsInFlatFieldMetadataMapsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectMetadataId: string;
};
export const findObjectFieldsInFlatFieldMetadataMaps = ({
  flatFieldMetadataMaps,
  objectMetadataId,
}: FindObjectFieldsInFlatFieldMetadataMapsArgs) => {
  return Object.values(flatFieldMetadataMaps.byId).reduce<{
    objectFlatFieldMetadataById: Record<string, FlatFieldMetadata>;
    objectFlatFieldMetadatas: FlatFieldMetadata[];
  }>(
    (acc, flatFieldMetadata) => {
      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.objectMetadataId !== objectMetadataId
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
