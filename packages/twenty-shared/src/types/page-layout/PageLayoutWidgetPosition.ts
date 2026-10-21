import type { PageLayoutTabLayoutMode } from './PageLayoutTabLayoutMode';
import type { PageLayoutWidgetVerticalListHeightBehavior } from './PageLayoutWidgetVerticalListHeightBehavior';

export type PageLayoutWidgetGridPosition = {
  layoutMode: PageLayoutTabLayoutMode.GRID;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export type PageLayoutWidgetVerticalListPosition = {
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST;
  index: number;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
};

export type PageLayoutWidgetCanvasPosition = {
  layoutMode: PageLayoutTabLayoutMode.CANVAS;
};

export type PageLayoutWidgetPosition =
  | PageLayoutWidgetGridPosition
  | PageLayoutWidgetVerticalListPosition
  | PageLayoutWidgetCanvasPosition;
