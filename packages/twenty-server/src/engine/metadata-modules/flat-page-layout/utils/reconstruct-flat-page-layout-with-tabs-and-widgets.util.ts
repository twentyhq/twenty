import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

export type FlatPageLayoutTabWithWidgets = FlatPageLayoutTab & {
  widgets: FlatPageLayoutWidget[];
};

export type FlatPageLayoutWithTabsAndWidgets = FlatPageLayout & {
  tabs: FlatPageLayoutTabWithWidgets[];
};

export const reconstructFlatPageLayoutWithTabsAndWidgets = ({
  layout,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: {
  layout: FlatPageLayout;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutWithTabsAndWidgets => {
  const tabs = Object.values(flatPageLayoutTabMaps.byId)
    .filter(isDefined)
    .filter(
      (tab) => tab.pageLayoutId === layout.id && !isDefined(tab.deletedAt),
    )
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const tabsWithWidgets: FlatPageLayoutTabWithWidgets[] = tabs.map((tab) => {
    const widgets = Object.values(flatPageLayoutWidgetMaps.byId)
      .filter(isDefined)
      .filter(
        (widget) =>
          widget.pageLayoutTabId === tab.id && !isDefined(widget.deletedAt),
      );

    return {
      ...tab,
      widgets,
      widgetIds: widgets.map((widget) => widget.id),
    };
  });

  return {
    ...layout,
    tabs: tabsWithWidgets,
    tabIds: tabsWithWidgets.map((tab) => tab.id),
  };
};
