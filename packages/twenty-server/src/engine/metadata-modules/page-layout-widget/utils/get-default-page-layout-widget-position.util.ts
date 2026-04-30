import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';

// Used as a backfill when callers do not specify a widget position. Shape
// follows the parent tab's layoutMode; the GRID variant advances column-first
// using widgetIndexInTab so multiple defaults don't all collide at (0,0).
export const getDefaultPageLayoutWidgetPosition = (
  layoutMode: PageLayoutTabLayoutMode,
  widgetIndexInTab: number,
): PageLayoutWidgetPosition => {
  switch (layoutMode) {
    case PageLayoutTabLayoutMode.CANVAS:
      return { layoutMode: PageLayoutTabLayoutMode.CANVAS };
    case PageLayoutTabLayoutMode.VERTICAL_LIST:
      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: widgetIndexInTab,
      };
    case PageLayoutTabLayoutMode.GRID:
      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: Math.floor(widgetIndexInTab / WIDGET_GRID_MAX_COLUMNS),
        column: widgetIndexInTab % WIDGET_GRID_MAX_COLUMNS,
        rowSpan: 1,
        columnSpan: 1,
      };
  }
};
