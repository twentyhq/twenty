import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ObjectFieldNamesAndJoinColumnNames = {
  fieldNames: string[];
  relationTargetFieldIdByJoinColumnName: Record<string, string>;
};
export const getObjectFieldNamesAndJoinColumnNames = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  remainingFlatEntityMapsToValidate?: FlatEntityMaps<FlatFieldMetadata>;
}): {
  objectFieldNamesAndJoinColumnNames: ObjectFieldNamesAndJoinColumnNames;
} => {
  const objectFlatFieldMetadatas =
    findManyFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityIds: flatObjectMetadata.fieldMetadataIds,
    });
  const initialAccumulator: ObjectFieldNamesAndJoinColumnNames = {
    relationTargetFieldIdByJoinColumnName: {},
    fieldNames: [],
  };

  const objectFieldNamesAndJoinColumnNames = objectFlatFieldMetadatas.reduce(
    (acc, flatFieldMetadata) => {
      const shouldSearchForJoinColumnName =
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
        flatFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY;

      if (!shouldSearchForJoinColumnName) {
        return {
          ...acc,
          fieldNames: [...acc.fieldNames, flatFieldMetadata.name],
        };
      }

      const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(targetFlatFieldMetadata) ||
        !isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata) ||
        !isDefined(targetFlatFieldMetadata.settings.joinColumnName)
      ) {
        return {
          ...acc,
          fieldNames: [...acc.fieldNames, flatFieldMetadata.name],
        };
      }

      return {
        ...acc,
        fieldNames: [...acc.fieldNames, flatFieldMetadata.name],
        relationTargetFieldIdByJoinColumnName: {
          ...acc.relationTargetFieldIdByJoinColumnName,
          [targetFlatFieldMetadata.settings.joinColumnName]:
            flatFieldMetadata.relationTargetFieldMetadataId,
        },
      };
    },
    initialAccumulator,
  );

  return { objectFieldNamesAndJoinColumnNames };
};
