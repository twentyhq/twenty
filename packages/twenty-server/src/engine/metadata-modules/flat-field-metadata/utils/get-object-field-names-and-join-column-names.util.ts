import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type ObjectFieldNamesAndJoinColumnNames = {
  fieldNames: string[];
  joinColumnNames: string[];
};
export const getObjectFieldNamesAndJoinColumnNames = ({
  universalFlatFieldMetadataMaps,
  universalFlatObjectMetadata,
}: {
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  universalFlatFieldMetadataMaps: UniversalFlatEntityMaps<UniversalFlatFieldMetadata>;
}): {
  objectFieldNamesAndJoinColumnNames: ObjectFieldNamesAndJoinColumnNames;
} => {
  const objectUniversalFlatFieldMetadatas =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: universalFlatFieldMetadataMaps,
      universalIdentifiers:
        universalFlatObjectMetadata.fieldUniversalIdentifiers,
    });
  const initialAccumulator: ObjectFieldNamesAndJoinColumnNames = {
    joinColumnNames: [],
    fieldNames: [],
  };

  const objectFieldNamesAndJoinColumnNames =
    objectUniversalFlatFieldMetadatas.reduce(
      (acc, universalFlatFieldMetadata) => {
        if (
          isMorphOrRelationUniversalFlatFieldMetadata(
            universalFlatFieldMetadata,
          ) &&
          universalFlatFieldMetadata.universalSettings.relationType ===
            RelationType.MANY_TO_ONE &&
          isDefined(universalFlatFieldMetadata.universalSettings.joinColumnName)
        ) {
          return {
            ...acc,
            fieldNames: [...acc.fieldNames, universalFlatFieldMetadata.name],
            joinColumnNames: [
              ...acc.joinColumnNames,
              universalFlatFieldMetadata.universalSettings.joinColumnName,
            ],
          };
        }

        return {
          ...acc,
          fieldNames: [...acc.fieldNames, universalFlatFieldMetadata.name],
        };
      },
      initialAccumulator,
    );

  return { objectFieldNamesAndJoinColumnNames };
};
