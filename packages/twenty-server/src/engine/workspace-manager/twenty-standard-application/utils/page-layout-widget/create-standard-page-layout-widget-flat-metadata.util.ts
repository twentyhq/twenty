import { type PageLayoutWidgetPosition } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import {
  type StandardPageLayoutTabDefinition,
  type StandardPageLayoutWidgetDefinition,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.types';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutWidgetContext = {
  layoutName: string;
  tabTitle: string;
  widgetName: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  position: PageLayoutWidgetPosition | null;
  configuration: AllPageLayoutWidgetConfiguration;
  objectMetadataId: string | null;
};

export type CreateStandardPageLayoutWidgetArgs = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutWidgetContext;
};

export const createStandardPageLayoutWidgetFlatMetadata = ({
  context: {
    layoutName,
    tabTitle,
    widgetName,
    title,
    type,
    gridPosition,
    position,
    configuration,
    objectMetadataId,
  },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutWidgetArgs): FlatPageLayoutWidget => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  const layout = STANDARD_PAGE_LAYOUTS[
    layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
  ] as { tabs: Record<string, StandardPageLayoutTabDefinition> };
  const widgetDef: StandardPageLayoutWidgetDefinition =
    layout.tabs[tabTitle].widgets[widgetName];

  if (!isDefined(widgetDef)) {
    throw new Error(
      `Invalid configuration ${layoutName} ${tabTitle} ${widgetName}`,
    );
  }

  const tabIds = layoutIds.tabs[tabTitle];
  const widgetIds = tabIds.widgets[widgetName];

  return {
    id: widgetIds.id,
    universalIdentifier: widgetDef.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    pageLayoutTabId: tabIds.id,
    title,
    type,
    gridPosition,
    position,
    configuration,
    objectMetadataId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalDisplay: null,
  };
};
