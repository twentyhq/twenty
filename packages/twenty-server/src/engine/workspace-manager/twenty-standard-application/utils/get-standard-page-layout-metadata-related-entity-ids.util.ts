import { v4 } from 'uuid';

import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';
import { type AllStandardPageLayoutWidgetName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-widget-name.type';

type StandardPageLayoutWidgetIds<
  L extends AllStandardPageLayoutName,
  T extends AllStandardPageLayoutTabName<L>,
> = Record<AllStandardPageLayoutWidgetName<L, T>, { id: string }>;

type StandardPageLayoutTabIds<L extends AllStandardPageLayoutName> = {
  [T in AllStandardPageLayoutTabName<L>]: {
    id: string;
    widgets: StandardPageLayoutWidgetIds<L, T>;
  };
};

export type StandardPageLayoutMetadataRelatedEntityIds = {
  [L in AllStandardPageLayoutName]: {
    id: string;
    tabs: StandardPageLayoutTabIds<L>;
  };
};

const computeStandardPageLayoutWidgetIds = <
  L extends AllStandardPageLayoutName,
  T extends AllStandardPageLayoutTabName<L>,
>({
  layoutName,
  tabName,
}: {
  layoutName: L;
  tabName: T;
}): StandardPageLayoutWidgetIds<L, T> => {
  // @ts-expect-error legacy generic pattern
  const tabDefinition = STANDARD_PAGE_LAYOUTS[layoutName].tabs[tabName] as {
    widgets: Record<string, unknown>;
  };

  const widgetNames = Object.keys(
    tabDefinition.widgets,
  ) as AllStandardPageLayoutWidgetName<L, T>[];

  const widgetIds = {} as StandardPageLayoutWidgetIds<L, T>;

  for (const widgetName of widgetNames) {
    widgetIds[widgetName] = { id: v4() };
  }

  return widgetIds;
};

const computeStandardPageLayoutTabIds = <L extends AllStandardPageLayoutName>({
  layoutName,
}: {
  layoutName: L;
}): StandardPageLayoutTabIds<L> => {
  const layoutDefinition = STANDARD_PAGE_LAYOUTS[layoutName];

  const tabNames = Object.keys(
    layoutDefinition.tabs,
  ) as AllStandardPageLayoutTabName<L>[];

  const tabIds = {} as StandardPageLayoutTabIds<L>;

  for (const tabName of tabNames) {
    const widgetIds = computeStandardPageLayoutWidgetIds({
      layoutName,
      tabName,
    });

    tabIds[tabName] = {
      id: v4(),
      widgets: widgetIds,
    };
  }

  return tabIds;
};

export const getStandardPageLayoutMetadataRelatedEntityIds =
  (): StandardPageLayoutMetadataRelatedEntityIds => {
    const result = {} as StandardPageLayoutMetadataRelatedEntityIds;

    for (const layoutName of Object.keys(
      STANDARD_PAGE_LAYOUTS,
    ) as AllStandardPageLayoutName[]) {
      const tabIds = computeStandardPageLayoutTabIds({
        layoutName,
      });

      result[layoutName] = {
        id: v4(),
        tabs: tabIds,
      };
    }

    return result;
  };
