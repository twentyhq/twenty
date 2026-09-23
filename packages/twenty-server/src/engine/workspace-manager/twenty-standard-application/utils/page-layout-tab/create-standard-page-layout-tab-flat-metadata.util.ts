import {
  type PageLayoutTabLayoutMode,
  PageLayoutType,
  type WidgetType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type StandardPageLayoutMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-page-layout-metadata-related-entity-ids.util';
import { type StandardPageLayoutTabConfig } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config';

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
  excludedWidgetTypes: WidgetType[];
  context: CreateStandardPageLayoutTabContext;
};

export const createStandardPageLayoutTabFlatMetadata = ({
  context: { layoutName, tabTitle, title, position, icon, layoutMode },
  workspaceId,
  twentyStandardApplicationId,
  standardPageLayoutMetadataRelatedEntityIds,
  excludedWidgetTypes,
  now,
}: CreateStandardPageLayoutTabArgs): FlatPageLayoutTab => {
  const layoutIds = standardPageLayoutMetadataRelatedEntityIds[layoutName];
  assertIsDefinedOrThrow(layoutIds);

  const layout = STANDARD_PAGE_LAYOUTS[
    layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
  ] as {
    universalIdentifier: string;
    type: PageLayoutType;
    tabs: Record<
      string,
      StandardPageLayoutTabConfig & {
        widgets: Record<
          string,
          { universalIdentifier: string; type?: WidgetType }
        >;
      }
    >;
  };
  const tabDefinition = layout.tabs[tabTitle];

  if (!isDefined(tabDefinition)) {
    throw new Error(`Invalid configuration ${layoutName} ${tabTitle}`);
  }

  const tabIds = layoutIds.tabs[tabTitle];
  assertIsDefinedOrThrow(tabIds);

  const widgetNames = Object.keys(tabDefinition.widgets).filter(
    (widgetName) => {
      const widget = tabDefinition.widgets[widgetName];

      assertIsDefinedOrThrow(widget);

      const widgetType = widget.type;

      return (
        !isDefined(widgetType) || !excludedWidgetTypes.includes(widgetType)
      );
    },
  );
  const widgetIds = widgetNames.map((widgetName) => {
    const widgetWidget = tabIds.widgets[widgetName];

    assertIsDefinedOrThrow(widgetWidget);

    return widgetWidget.id;
  });
  const widgetUniversalIdentifiers = widgetNames.map((widgetName) => {
    const widgetDefinition = tabDefinition.widgets[widgetName];

    assertIsDefinedOrThrow(widgetDefinition);

    return widgetDefinition.universalIdentifier;
  });

  return {
    id: tabIds.id,
    universalIdentifier: tabDefinition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    title,
    position,
    pageLayoutId: layoutIds.id,
    pageLayoutUniversalIdentifier: layout.universalIdentifier,
    widgetIds,
    widgetUniversalIdentifiers,
    isActive: true,
    isSystemSideEffect: layout.type === PageLayoutType.RECORD_PAGE,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    icon,
    layoutMode,
    overrides: null,
  };
};
