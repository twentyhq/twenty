import { isDefined } from 'twenty-shared/utils';

import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps-or-throw.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildUniversalFlatObjectFieldByNameAndJoinColumnMaps = ({
  flatFieldMetadataMaps,
  flatObjectMetadata,
}: {
  flatFieldMetadataMaps: AllUniversalFlatEntityMaps['flatFieldMetadataMaps'];
  flatObjectMetadata: UniversalFlatObjectMetadata;
}) => {
  const fieldUniversalIdentifierByName: Record<string, string> = {};
  const fieldUniversalIdentifierByJoinColumnName: Record<string, string> = {};

  const objectFields =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMapsOrThrow({
      universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  for (const field of objectFields) {
    fieldUniversalIdentifierByName[field.name] = field.universalIdentifier;

    if (isMorphOrRelationUniversalFlatFieldMetadata(field)) {
      if (isDefined(field.universalSettings.joinColumnName)) {
        fieldUniversalIdentifierByJoinColumnName[
          field.universalSettings.joinColumnName
        ] = field.universalIdentifier;
      }
    }
  }

  return {
    fieldUniversalIdentifierByName,
    fieldUniversalIdentifierByJoinColumnName,
  };
};
