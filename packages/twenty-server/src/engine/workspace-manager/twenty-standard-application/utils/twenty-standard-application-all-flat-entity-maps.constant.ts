import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { TWENTY_STANDARD_ALL_METADATA_NAME } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-all-metadata-name.constant';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import { buildStandardFlatAgentMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/agent-metadata/build-standard-flat-agent-metadata-maps.util';
import { buildStandardFlatFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/field-metadata/build-standard-flat-field-metadata-maps.util';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { getStandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';
import { buildStandardFlatIndexMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/build-standard-flat-index-metadata-maps.util';
import { buildStandardFlatNavigationMenuItemMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/build-standard-flat-navigation-menu-item-maps.util';
import { buildStandardFlatObjectMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/object-metadata/build-standard-flat-object-metadata-maps.util';
import { buildStandardFlatPageLayoutTabMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/build-standard-flat-page-layout-tab-metadata-maps.util';
import { buildStandardFlatPageLayoutWidgetMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-widget/build-standard-flat-page-layout-widget-metadata-maps.util';
import { buildStandardFlatPageLayoutMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/build-standard-flat-page-layout-metadata-maps.util';
import { buildStandardFlatRoleMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/role-metadata/build-standard-flat-role-metadata-maps.util';
import { buildStandardFlatSkillMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/skill-metadata/build-standard-flat-skill-metadata-maps.util';
import { buildStandardFlatViewFieldMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/build-standard-flat-view-field-metadata-maps.util';
import { buildStandardFlatViewFieldGroupMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/build-standard-flat-view-field-group-metadata-maps.util';
import { buildStandardFlatViewFilterMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-filter/build-standard-flat-view-filter-metadata-maps.util';
import { buildStandardFlatViewGroupMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-group/build-standard-flat-view-group-metadata-maps.util';
import { buildStandardFlatViewMetadataMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/build-standard-flat-view-metadata-maps.util';
import { type IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';

export type ComputeTwentyStandardApplicationAllFlatEntityMapsArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  shouldIncludeRecordPageLayouts?: boolean;
};

export const computeTwentyStandardApplicationAllFlatEntityMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  shouldIncludeRecordPageLayouts,
}: ComputeTwentyStandardApplicationAllFlatEntityMapsArgs): {
  allFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
  // TODO remove once all metadatas has fully been universal migrated
  idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
} => {
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
    shouldIncludeRecordPageLayouts,
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

  const flatViewFieldGroupMaps = buildStandardFlatViewFieldGroupMetadataMaps({
    dependencyFlatEntityMaps: {
      flatViewMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
    shouldIncludeRecordPageLayouts,
  });

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
      flatViewFieldGroupMaps,
    },
    now,
    standardObjectMetadataRelatedEntityIds,
    twentyStandardApplicationId,
    workspaceId,
    shouldIncludeRecordPageLayouts,
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

  const standardPageLayoutMetadataRelatedEntityIds =
    getStandardPageLayoutMetadataRelatedEntityIds();

  const flatPageLayoutMaps = buildStandardFlatPageLayoutMetadataMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    standardObjectMetadataRelatedEntityIds,
    standardPageLayoutMetadataRelatedEntityIds,
    shouldIncludeRecordPageLayouts,
  });

  const flatPageLayoutTabMaps = buildStandardFlatPageLayoutTabMetadataMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    standardPageLayoutMetadataRelatedEntityIds,
    shouldIncludeRecordPageLayouts,
  });

  const flatPageLayoutWidgetMaps =
    buildStandardFlatPageLayoutWidgetMetadataMaps({
      now,
      workspaceId,
      twentyStandardApplicationId,
      standardObjectMetadataRelatedEntityIds,
      standardPageLayoutMetadataRelatedEntityIds,
      shouldIncludeRecordPageLayouts,
    });

  const flatNavigationMenuItemMaps = buildStandardFlatNavigationMenuItemMaps({
    now,
    workspaceId,
    twentyStandardApplicationId,
    dependencyFlatEntityMaps: {
      flatViewMaps,
    },
  });

  const allFlatEntityMaps: TwentyStandardAllFlatEntityMaps = {
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatViewFilterMaps,
    flatViewGroupMaps,
    flatViewMaps,
    flatIndexMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatNavigationMenuItemMaps,
    flatRoleMaps,
    flatAgentMaps,
    flatSkillMaps,
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  };

  const idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName =
    {};

  for (const metadataName of TWENTY_STANDARD_ALL_METADATA_NAME) {
    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const flatEntityMaps = allFlatEntityMaps[flatEntityMapsKey];

    const idByUniversalIdentifier = Object.fromEntries(
      Object.entries(flatEntityMaps.universalIdentifierById)
        .filter((entry): entry is [string, string] => isDefined(entry[1]))
        .map(([id, universalIdentifier]) => [universalIdentifier, id]),
    );

    if (Object.keys(idByUniversalIdentifier).length > 0) {
      idByUniversalIdentifierByMetadataName[metadataName] =
        idByUniversalIdentifier;
    }
  }

  return {
    allFlatEntityMaps,
    idByUniversalIdentifierByMetadataName,
  };
};
