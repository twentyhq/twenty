import { isDefined } from 'twenty-shared/utils';

import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { groupFlatPageLayoutWidgetsByResolvedPageLayoutTabId } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/group-flat-page-layout-widgets-by-resolved-page-layout-tab-id.util';
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
  widgetsByPageLayoutTabId,
}: {
  layout: FlatPageLayout;
  flatPageLayoutTabMaps: FlatPageLayoutTabMaps;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  // Callers reconstructing several layouts at once should build it once and share it
  widgetsByPageLayoutTabId?: Map<string, FlatPageLayoutWidget[]>;
}): FlatPageLayoutWithTabsAndWidgets => {
  const tabs = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatPageLayoutTabMaps,
    flatEntityIds: layout.tabIds,
  })
    .filter((tab) => !isDefined(tab.deletedAt))
    .sort((tabA, tabB) => (tabA.position ?? 0) - (tabB.position ?? 0));

  const resolvedWidgetsByPageLayoutTabId =
    widgetsByPageLayoutTabId ??
    groupFlatPageLayoutWidgetsByResolvedPageLayoutTabId(
      flatPageLayoutWidgetMaps,
    );

  const tabsWithWidgets: FlatPageLayoutTabWithWidgets[] = tabs.map((tab) => {
    const widgets = resolvedWidgetsByPageLayoutTabId.get(tab.id) ?? [];

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
