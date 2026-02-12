import { v4 } from 'uuid';

import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';

type WidgetIds = Record<string, { id: string }>;

type TabIds = Record<string, { id: string; widgets: WidgetIds }>;

export type StandardPageLayoutMetadataRelatedEntityIds = Record<
  string,
  { id: string; tabs: TabIds }
>;

const computeWidgetIds = (widgets: Record<string, unknown>): WidgetIds => {
  const widgetIds: WidgetIds = {};

  for (const widgetName of Object.keys(widgets)) {
    widgetIds[widgetName] = { id: v4() };
  }

  return widgetIds;
};

const computeTabIds = (
  tabs: Record<string, { widgets: Record<string, unknown> }>,
): TabIds => {
  const tabIds: TabIds = {};

  for (const tabTitle of Object.keys(tabs)) {
    tabIds[tabTitle] = {
      id: v4(),
      widgets: computeWidgetIds(tabs[tabTitle].widgets),
    };
  }

  return tabIds;
};

export const getStandardPageLayoutMetadataRelatedEntityIds =
  (): StandardPageLayoutMetadataRelatedEntityIds => {
    const result: StandardPageLayoutMetadataRelatedEntityIds = {};

    for (const layoutName of Object.keys(STANDARD_PAGE_LAYOUTS)) {
      const layout = STANDARD_PAGE_LAYOUTS[
        layoutName as keyof typeof STANDARD_PAGE_LAYOUTS
      ] as { tabs: Record<string, { widgets: Record<string, unknown> }> };

      result[layoutName] = {
        id: v4(),
        tabs: computeTabIds(layout.tabs),
      };
    }

    return result;
  };
