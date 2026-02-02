import type { PageLayoutTabLayoutMode } from './PageLayoutTabLayoutMode';

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
};

export type PageLayoutWidgetCanvasPosition = {
  layoutMode: PageLayoutTabLayoutMode.CANVAS;
};

export type PageLayoutWidgetPosition =
  | PageLayoutWidgetGridPosition
  | PageLayoutWidgetVerticalListPosition
  | PageLayoutWidgetCanvasPosition;
