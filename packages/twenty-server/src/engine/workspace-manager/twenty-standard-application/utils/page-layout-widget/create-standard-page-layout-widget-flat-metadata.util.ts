import {
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type StandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';
import {
  type StandardPageLayoutTabConfig,
  type StandardPageLayoutWidgetConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config';

export type CreateStandardPageLayoutWidgetContext = {
  layoutName: string;
  tabTitle: string;
  widgetName: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  position: PageLayoutWidgetPosition | null;
  configuration: AllPageLayoutWidgetConfiguration;
  universalConfiguration: MetadataUniversalFlatEntity<'pageLayoutWidget'>['universalConfiguration'];
  objectMetadataId: string | null;
  conditionalDisplay: PageLayoutWidgetConditionalDisplay | null;
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
    universalConfiguration,
    objectMetadataId,
    conditionalDisplay,
  },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  objectMetadataUniversalIdentifier,
  now,
}: CreateStandardPageLayoutWidgetArgs & {
  objectMetadataUniversalIdentifier: string | null;
}): FlatPageLayoutWidget => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  const layout = STANDARD_PAGE_LAYOUTS[
    layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
  ] as {
    tabs: Record<
      string,
      StandardPageLayoutTabConfig & {
        universalIdentifier: string;
      }
    >;
  };
  const tabDefinition = layout.tabs[tabTitle];
  const widgetDef: StandardPageLayoutWidgetConfig =
    tabDefinition.widgets[widgetName];

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
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    pageLayoutTabId: tabIds.id,
    pageLayoutTabUniversalIdentifier: tabDefinition.universalIdentifier,
    title,
    type,
    gridPosition,
    position,
    configuration,
    universalConfiguration,
    objectMetadataId,
    objectMetadataUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    conditionalDisplay: conditionalDisplay ?? null,
  };
};
