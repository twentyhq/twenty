import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';
import { buildStandardFlatIndexMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-flat-index-metadata-maps.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';

export type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs = {
  now: Date;
  workspaceId: string;
  twentyStandardApplicationId: string;
};

export const computeTwentyStandardApplicationAllFlatEntityMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
}: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs): AllFlatEntityMaps => {
  const standardFieldMetadataIdByObjectAndFieldName =
    getStandardFieldMetadataIdByObjectAndFieldName();

  const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
    now,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    },
  });

  const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps({
    now,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps,
    },
    twentyStandardApplicationId,
  });

  const flatIndexMaps = buildStandardFlatIndexMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    now,
    standardFieldMetadataIdByObjectAndFieldName,
    workspaceId,
    twentyStandardApplicationId,
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
    flatIndexMaps,
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
    flatPageLayoutMaps: {
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
