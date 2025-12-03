import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getStandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/build-standard-flat-field-metadata-maps.util';
import { buildStandardFlatObjectMetadatas } from './create-standard-flat-object-metadata.util';

export const buildTwentyStandardApplicationAllFlatEntityMaps = ({
  createdAt,
  workspaceId,
}: {
  createdAt: Date;
  workspaceId: string;
}): AllFlatEntityMaps => {
  const standardFieldMetadataIdByObjectAndFieldName =
    getStandardFieldMetadataIdByObjectAndFieldName();
  const standardFlatObjectMetadatas = buildStandardFlatObjectMetadatas({
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  });

  // Build the byId map
  const flatObjectMetadataById: Record<string, FlatObjectMetadata> =
    Object.fromEntries(
      Object.values(standardFlatObjectMetadatas).map((metadata) => [
        metadata.id,
        metadata,
      ]),
    );

  // Build field metadata maps using addFlatEntityToFlatEntityMapsOrThrow to prevent duplicate IDs
  const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps({
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  });

  return {
    flatAgentMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatCronTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatDatabaseEventTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps,
    flatIndexMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatObjectMetadataMaps: {
      byId: flatObjectMetadataById,
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRoleMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRoleTargetMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatRouteTriggerMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatServerlessFunctionMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewFieldMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewFilterMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewGroupMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatViewMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
  };
};
