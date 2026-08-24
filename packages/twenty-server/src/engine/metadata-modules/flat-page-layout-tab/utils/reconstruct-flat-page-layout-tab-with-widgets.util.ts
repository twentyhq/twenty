import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { groupFlatPageLayoutWidgetsByResolvedPageLayoutTabId } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/group-flat-page-layout-widgets-by-resolved-page-layout-tab-id.util';

export type FlatPageLayoutTabWithWidgets = FlatPageLayoutTab & {
  widgets: FlatPageLayoutWidget[];
};

export const reconstructFlatPageLayoutTabWithWidgets = ({
  tab,
  flatPageLayoutWidgetMaps,
  widgetsByPageLayoutTabId,
}: {
  tab: FlatPageLayoutTab;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
  // Callers reconstructing several tabs at once should build it once and share it
  widgetsByPageLayoutTabId?: Map<string, FlatPageLayoutWidget[]>;
}): FlatPageLayoutTabWithWidgets => {
  const resolvedWidgetsByPageLayoutTabId =
    widgetsByPageLayoutTabId ??
    groupFlatPageLayoutWidgetsByResolvedPageLayoutTabId(
      flatPageLayoutWidgetMaps,
    );
  const widgets = resolvedWidgetsByPageLayoutTabId.get(tab.id) ?? [];

  return {
    ...tab,
    widgets,
    widgetIds: widgets.map((widget) => widget.id),
  };
};
