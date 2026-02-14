import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {
  STANDARD_PAGE_LAYOUTS,
  STANDARD_RECORD_PAGE_LAYOUTS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardPageLayoutTabConfig } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';
import {
  type CreateStandardPageLayoutTabArgs,
  createStandardPageLayoutTabFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/create-standard-page-layout-tab-flat-metadata.util';

export type BuildStandardFlatPageLayoutTabMetadataMapsArgs = Omit<
  CreateStandardPageLayoutTabArgs,
  'context'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

export const buildStandardFlatPageLayoutTabMetadataMaps = ({
  now,
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  shouldIncludeRecordPageLayouts,
}: BuildStandardFlatPageLayoutTabMetadataMapsArgs): FlatEntityMaps<FlatPageLayoutTab> => {
  const allPageLayoutTabMetadatas: FlatPageLayoutTab[] = [];
  const recordPageLayoutNames = Object.keys(STANDARD_RECORD_PAGE_LAYOUTS);

  for (const layoutName of Object.keys(STANDARD_PAGE_LAYOUTS)) {
    if (
      !shouldIncludeRecordPageLayouts &&
      recordPageLayoutNames.includes(layoutName)
    ) {
      continue;
    }

    const layout = STANDARD_PAGE_LAYOUTS[
      layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
    ] as { tabs: Record<string, StandardPageLayoutTabConfig> };

    for (const tabTitle of Object.keys(layout.tabs)) {
      const tab = layout.tabs[tabTitle];

      allPageLayoutTabMetadatas.push(
        createStandardPageLayoutTabFlatMetadata({
          now,
          workspaceId,
          twentyStandardApplicationId,
          standardPageLayoutMetadataRelatedEntityIds,
          context: {
            layoutName,
            tabTitle,
            title: tab.title,
            position: tab.position,
            icon: tab.icon,
            layoutMode: tab.layoutMode,
          },
        }),
      );
    }
  }

  let flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

  for (const pageLayoutTabMetadata of allPageLayoutTabMetadatas) {
    flatPageLayoutTabMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: pageLayoutTabMetadata,
      flatEntityMaps: flatPageLayoutTabMaps,
    });
  }

  return flatPageLayoutTabMaps;
};
