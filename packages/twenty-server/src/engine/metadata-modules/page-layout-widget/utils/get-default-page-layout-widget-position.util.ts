import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';

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
