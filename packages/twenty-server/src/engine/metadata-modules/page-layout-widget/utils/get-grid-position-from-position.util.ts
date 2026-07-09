import {
  type GridPosition,
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

// gridPosition is deprecated and removed by
// DropPageLayoutWidgetGridPositionColumn (2.20), but the column is still present
// and NOT NULL on instances that have not reached that step yet. Derive a value
// from the canonical `position` so widget inserts satisfy the constraint until
// the column is dropped; the @WasRemovedInUpgrade adapter excludes it afterwards.
export const getGridPositionFromPosition = (
  position: PageLayoutWidgetPosition,
): GridPosition =>
  position.layoutMode === PageLayoutTabLayoutMode.GRID
    ? {
        row: position.row,
        column: position.column,
        rowSpan: position.rowSpan,
        columnSpan: position.columnSpan,
      }
    : { row: 0, column: 0, rowSpan: 1, columnSpan: 1 };
