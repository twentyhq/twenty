import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import { buildStandardFlatAgentMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/build-standard-flat-agent-metadata-maps.util';
import { buildStandardFlatSkillMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/skill-metadata/build-standard-flat-skill-metadata-maps.util';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildStandardFlatIndexMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-flat-index-metadata-maps.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';
import { buildStandardFlatRoleMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/build-standard-flat-role-metadata-maps.util';
import { buildStandardFlatViewFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/build-standard-flat-view-field-metadata-maps.util';
import { buildStandardFlatViewFilterMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/build-standard-flat-view-filter-metadata-maps.util';
import { buildStandardFlatViewGroupMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/build-standard-flat-view-group-metadata-maps.util';
import { buildStandardFlatViewMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/build-standard-flat-view-metadata-maps.util';

export type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
};

export const computeTwentyStandardApplicationAllFlatEntityMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
}: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs): TwentyStandardAllFlatEntityMaps => {
  const standardObjectMetadataRelatedEntityIds =
    getStandardObjectMetadataRelatedEntityIds();

  const flatObjectMetadataMaps = buildStandardFlatObjectMetadataMaps({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    },
  });

  const flatFieldMetadataMaps = buildStandardFlatFieldMetadataMaps({
    now,
    workspaceId,
    standardObjectMetadataRelatedEntityIds,
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
    standardObjectMetadataRelatedEntityIds,
    workspaceId,
    twentyStandardApplicationId,
  });

  const flatViewMaps = buildStandardFlatViewMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
  });

  const flatViewGroupMaps = buildStandardFlatViewGroupMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
  });

  const flatViewFilterGroupMaps = createEmptyFlatEntityMaps();

  const flatViewFilterMaps = buildStandardFlatViewFilterMetadataMaps({
    dependencyFlatEntityMaps: {
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFilterGroupMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
  });

  const flatViewFieldMaps = buildStandardFlatViewFieldMetadataMaps({
    dependencyFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
  });

  const flatRoleMaps = buildStandardFlatRoleMetadataMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: undefined,
  });

  const flatAgentMaps = buildStandardFlatAgentMetadataMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: {
      flatRoleMaps,
    },
  });

  const flatSkillMaps = buildStandardFlatSkillMetadataMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    dependencyFlatEntityMaps: undefined,
  });

  return {
    flatViewFieldMaps,
    flatViewFilterMaps,
    flatViewGroupMaps,
    flatViewMaps,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatRoleMaps,
    flatAgentMaps,
    flatSkillMaps,
  };
};
