import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { resolveOverridableEntityProperty } from 'src/engine/metadata-modules/utils/resolve-overridable-entity-property.util';

// A widget can be moved to another tab through an override, so it cannot be
// resolved from the tab widgetIds aggregator, which is built on the raw column
export const groupFlatPageLayoutWidgetsByResolvedPageLayoutTabId = (
  flatPageLayoutWidgetMaps: FlatPageLayoutWidgetMaps,
): Map<string, FlatPageLayoutWidget[]> => {
  const widgetsByPageLayoutTabId = new Map<string, FlatPageLayoutWidget[]>();

  for (const widget of Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(widget) || isDefined(widget.deletedAt)) {
      continue;
    }

    const pageLayoutTabId = resolveOverridableEntityProperty(
      widget,
      'pageLayoutTabId',
    );
    const existingWidgets = widgetsByPageLayoutTabId.get(pageLayoutTabId) ?? [];

    existingWidgets.push(widget);
    widgetsByPageLayoutTabId.set(pageLayoutTabId, existingWidgets);
  }

  return widgetsByPageLayoutTabId;
};
