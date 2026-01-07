import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

type GridPosition = {
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
};

export const validateWidgetGridPosition = (
  gridPosition: GridPosition,
  widgetTitle: string,
): void => {
  const { row, column, rowSpan, columnSpan } = gridPosition;

  if (column >= WIDGET_GRID_MAX_COLUMNS) {
    throw new PageLayoutWidgetException(
      generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_GRID_POSITION,
        widgetTitle,
        undefined,
        `column ${column} exceeds grid width (max column is ${WIDGET_GRID_MAX_COLUMNS - 1})`,
      ),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  if (column + columnSpan > WIDGET_GRID_MAX_COLUMNS) {
    throw new PageLayoutWidgetException(
      generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_GRID_POSITION,
        widgetTitle,
        undefined,
        `widget extends beyond grid width (column ${column} + columnSpan ${columnSpan} > ${WIDGET_GRID_MAX_COLUMNS})`,
      ),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  if (row >= WIDGET_GRID_MAX_ROWS) {
    throw new PageLayoutWidgetException(
      generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_GRID_POSITION,
        widgetTitle,
        undefined,
        `row ${row} exceeds maximum allowed rows (${WIDGET_GRID_MAX_ROWS})`,
      ),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }

  if (row + rowSpan > WIDGET_GRID_MAX_ROWS) {
    throw new PageLayoutWidgetException(
      generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_GRID_POSITION,
        widgetTitle,
        undefined,
        `widget extends beyond grid height (row ${row} + rowSpan ${rowSpan} > ${WIDGET_GRID_MAX_ROWS})`,
      ),
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
  }
};
