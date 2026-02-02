import { type PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type StandardPageLayoutTabDefinition } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.types';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutTabContext = {
  layoutName: string;
  tabTitle: string;
  title: string;
  position: number;
  icon: string | null;
  layoutMode: PageLayoutTabLayoutMode;
};

export type CreateStandardPageLayoutTabArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutTabContext;
};

export const createStandardPageLayoutTabFlatMetadata = ({
  context: { layoutName, tabTitle, title, position, icon, layoutMode },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutTabArgs): FlatPageLayoutTab => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  const layout = STANDARD_PAGE_LAYOUTS[
    layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
  ] as { tabs: Record<string, StandardPageLayoutTabDefinition> };
  const tabDefinition = layout.tabs[tabTitle];

  if (!isDefined(tabDefinition)) {
    throw new Error(`Invalid configuration ${layoutName} ${tabTitle}`);
  }

  const tabIds = layoutIds.tabs[tabTitle];
  const widgetIds = Object.values(tabIds.widgets).map((widget) => widget.id);

  return {
    id: tabIds.id,
    universalIdentifier: tabDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    title,
    position,
    pageLayoutId: layoutIds.id,
    widgetIds,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    icon,
    layoutMode,
  };
};
