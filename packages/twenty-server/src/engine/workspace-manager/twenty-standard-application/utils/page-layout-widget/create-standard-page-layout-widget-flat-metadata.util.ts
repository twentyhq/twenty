import { isDefined } from 'class-validator';

import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';
import { type AllStandardPageLayoutWidgetName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-widget-name.type';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';

export type CreateStandardPageLayoutWidgetContext<
  L extends AllStandardPageLayoutName,
  T extends AllStandardPageLayoutTabName<L>,
> = {
  layoutName: L;
  tabName: T;
  widgetName: AllStandardPageLayoutWidgetName<L, T>;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  configuration: AllPageLayoutWidgetConfiguration;
  objectMetadataId: string | null;
};

export type CreateStandardPageLayoutWidgetArgs<
  L extends AllStandardPageLayoutName = AllStandardPageLayoutName,
  T extends AllStandardPageLayoutTabName<L> = AllStandardPageLayoutTabName<L>,
> = {
  now: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  standardObjectMetadataRelatedEntityIds: StandardObjectMetadataRelatedEntityIds;
  standardPageLayoutMetadataRelatedEntityIds: StandardPageLayoutMetadataRelatedEntityIds;
  context: CreateStandardPageLayoutWidgetContext<L, T>;
};

export const createStandardPageLayoutWidgetFlatMetadata = <
  L extends AllStandardPageLayoutName,
  T extends AllStandardPageLayoutTabName<L>,
>({
  context: {
    layoutName,
    tabName,
    widgetName,
    title,
    type,
    gridPosition,
    configuration,
    objectMetadataId,
  },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  now,
}: CreateStandardPageLayoutWidgetArgs<L, T>): FlatPageLayoutWidget => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  // @ts-expect-error ignore
  const widgetDef = STANDARD_PAGE_LAYOUTS[layoutName].tabs[tabName].widgets[
    widgetName
  ] as {
    universalIdentifier: string;
  };

  if (!isDefined(widgetDef)) {
    throw new Error(
      `Invalid configuration ${layoutName} ${tabName.toString()} ${widgetName}`,
    );
  }

  const tabIds = layoutIds.tabs[tabName];
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
    configuration,
    objectMetadataId,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
};
