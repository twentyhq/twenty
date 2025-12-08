import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/build-standard-flat-field-metadata-maps.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/build-standard-flat-object-metadata-maps.util';
import { getStandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export const computeTwentyStandardApplicationAllFlatEntityMaps = ({
  createdAt,
  workspaceId,
}: {
  createdAt: Date;
  workspaceId: string;
}): AllFlatEntityMaps => {
  const standardFieldMetadataIdByObjectAndFieldName =
    getStandardFieldMetadataIdByObjectAndFieldName();

  const builderArgs = {
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  };

  // Build object metadata maps using addFlatEntityToFlatEntityMapsOrThrow to prevent duplicate IDs
  const flatObjectMetadataMaps =
    buildStandardFlatObjectMetadataMaps(builderArgs);

  // Build field metadata maps using addFlatEntityToFlatEntityMapsOrThrow to prevent duplicate IDs
  const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps(builderArgs);

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
    flatObjectMetadataMaps,
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
    flatPageLayoutWidgetMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
    flatPageLayoutTabMaps: {
      byId: {},
      idByUniversalIdentifier: {},
      universalIdentifiersByApplicationId: {},
    },
  };
};
