import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ObjectFieldNamesAndJoinColumnNames = {
  fieldNames: string[];
  joinColumnNames: string[];
};
export const getObjectFieldNamesAndJoinColumnNames = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): {
  objectFieldNamesAndJoinColumnNames: ObjectFieldNamesAndJoinColumnNames;
} => {
  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });
  const initialAccumulator: ObjectFieldNamesAndJoinColumnNames = {
    joinColumnNames: [],
    fieldNames: [],
  };

  const objectFieldNamesAndJoinColumnNames = objectFlatFieldMetadatas.reduce(
    (acc, flatFieldMetadata) => {
      if (
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
        flatFieldMetadata.settings.relationType === RelationType.MANY_TO_ONE &&
        isDefined(flatFieldMetadata.settings.joinColumnName)
      ) {
        return {
          ...acc,
          fieldNames: [...acc.fieldNames, flatFieldMetadata.name],
          joinColumnNames: [
            ...acc.joinColumnNames,
            flatFieldMetadata.settings.joinColumnName,
          ],
        };
      }

      return {
        ...acc,
        fieldNames: [...acc.fieldNames, flatFieldMetadata.name],
      };
    },
    initialAccumulator,
  );

  return { objectFieldNamesAndJoinColumnNames };
};
