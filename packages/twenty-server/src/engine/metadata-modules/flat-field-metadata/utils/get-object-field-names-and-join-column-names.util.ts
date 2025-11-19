import { writeFileSync } from 'fs';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type ObjectFieldNamesAndJoinColumnNames = {
  names: string[];
  joinColumnNames: string[];
};
export const getObjectFieldNamesAndJoinColumnNames = ({
  flatFieldMetadataMaps,
  remainingFlatEntityMapsToValidate,
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
    joinColumnNames: [],
    names: [],
  };

  const objectFieldNamesAndJoinColumnNames = objectFlatFieldMetadatas.reduce(
    (acc, flatFieldMetadata) => {
      const shouldSearchForJoinColumnName =
        isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
        flatFieldMetadata.settings.relationType === RelationType.ONE_TO_MANY;

      if (!shouldSearchForJoinColumnName) {
        return {
          ...acc,
          names: [...acc.names, flatFieldMetadata.name],
        };
      }

      const targetFlatFieldMetadata =
        remainingFlatEntityMapsToValidate?.byId[
          flatFieldMetadata.relationTargetFieldMetadataId
        ] ??
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatFieldMetadata.relationTargetFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

      if (
        !isDefined(targetFlatFieldMetadata) ||
        !isMorphOrRelationFlatFieldMetadata(targetFlatFieldMetadata) ||
        !isDefined(targetFlatFieldMetadata.settings.joinColumnName)
      ) {
        writeFileSync(
          `${Date.now()}-not-found.json`,
          JSON.stringify(
            {
              flatFieldMetadata,
              flatFieldMetadataMaps,
              remainingFlatEntityMapsToValidate,
            },
            null,
            2,
          ),
        );
        return {
          ...acc,
          names: [...acc.names, flatFieldMetadata.name],
        };
      }

      return {
        ...acc,
        names: [...acc.names, flatFieldMetadata.name],
        joinColumnNames: [
          ...acc.joinColumnNames,
          targetFlatFieldMetadata.settings.joinColumnName,
        ],
      };
    },
    initialAccumulator,
  );

  return { objectFieldNamesAndJoinColumnNames };
};
