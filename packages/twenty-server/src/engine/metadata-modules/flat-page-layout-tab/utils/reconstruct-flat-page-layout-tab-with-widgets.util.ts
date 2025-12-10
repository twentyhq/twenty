import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export type FlatPageLayoutTabWithWidgets = FlatPageLayoutTab & {
  widgets: FlatPageLayoutWidget[];
};

export const reconstructFlatPageLayoutTabWithWidgets = ({
  tab,
  flatPageLayoutWidgetMaps,
}: {
  tab: FlatPageLayoutTab;
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps;
}): FlatPageLayoutTabWithWidgets => {
  const widgets = Object.values(flatPageLayoutWidgetMaps.byId).filter(
    (widget): widget is FlatPageLayoutWidget =>
      isDefined(widget) &&
      widget.pageLayoutTabId === tab.id &&
      !isDefined(widget.deletedAt),
  );

  return {
    ...tab,
    widgets,
    widgetIds: widgets.map((widget) => widget.id),
  };
};
