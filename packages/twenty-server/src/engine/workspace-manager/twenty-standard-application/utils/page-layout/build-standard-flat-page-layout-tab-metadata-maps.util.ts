import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {
  STANDARD_PAGE_LAYOUTS,
  type StandardPageLayoutName,
  type StandardPageLayoutTabName,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type BuildStandardFlatPageLayoutTabMetadataMapsArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
};

export const buildStandardFlatPageLayoutTabMetadataMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
}: BuildStandardFlatPageLayoutTabMetadataMapsArgs): FlatEntityMaps<FlatPageLayoutTab> => {
  let flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

  for (const layoutName of Object.keys(
    STANDARD_PAGE_LAYOUTS,
  ) as StandardPageLayoutName[]) {
    const layoutDefinition = STANDARD_PAGE_LAYOUTS[layoutName];
    const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];

    for (const tabName of Object.keys(
      layoutDefinition.tabs,
    ) as StandardPageLayoutTabName<typeof layoutName>[]) {
      const tabDefinition = layoutDefinition.tabs[tabName];
      const tabIds = layoutIds.tabs[tabName];

      const widgetIds = Object.values(tabIds.widgets).map(
        (widget) => widget.id,
      );

      const flatPageLayoutTab: FlatPageLayoutTab = {
        id: tabIds.id,
        universalIdentifier: tabDefinition.universalIdentifier,
        applicationId: twentyStandardApplicationId,
        workspaceId,
        title: tabDefinition.title,
        position: tabDefinition.position,
        pageLayoutId: layoutIds.id,
        widgetIds,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      flatPageLayoutTabMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatPageLayoutTab,
        flatEntityMaps: flatPageLayoutTabMaps,
      });
    }
  }

  return flatPageLayoutTabMaps;
};
