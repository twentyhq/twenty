import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { type z } from 'zod';

import { widgetPositionSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/widget-position.schema';

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 12,
  columnSpan: 12,
} as const;

// The server's CreatePageLayoutWidgetInput.gridPosition is still required
// even when the tab layoutMode is VERTICAL_LIST or CANVAS. Match how the
// frontend stores widgets in those modes: a full-tab default grid box.
export const deriveGridPositionForWidget = (
  position: z.infer<typeof widgetPositionSchema>,
): {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
} => {
  if (position.layoutMode === PageLayoutTabLayoutMode.GRID) {
    return {
      row: position.row,
      column: position.column,
      rowSpan: position.rowSpan,
      columnSpan: position.columnSpan,
    };
  }

  return DEFAULT_GRID_POSITION;
};
