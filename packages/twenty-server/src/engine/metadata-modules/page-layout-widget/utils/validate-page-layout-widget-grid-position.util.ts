import { msg } from '@lingui/core/macro';
import { type PageLayoutWidgetGridPosition } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import {
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

const getInvalidPositionError = ({
  widgetTitle,
  detail,
}: {
  widgetTitle: string;
  detail: string;
}): FlatEntityValidationError => ({
  code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
  message: generatePageLayoutWidgetExceptionMessage(
    PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
    widgetTitle,
    undefined,
    detail,
  ),
  userFriendlyMessage: msg`Invalid widget position`,
});

const isValidInteger = (value: unknown) =>
  isDefined(value) && typeof value === 'number' && Number.isInteger(value);

export const validatePageLayoutWidgetGridPosition = (
  position: PageLayoutWidgetGridPosition,
  widgetTitle: string,
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const { row, column, rowSpan, columnSpan } = position;

  if (!isValidInteger(row)) {
    errors.push(
      getInvalidPositionError({
        widgetTitle,
        detail: `row must be an integer, received ${String(row)}`,
      }),
    );
  }

  if (!isValidInteger(column)) {
    errors.push(
      getInvalidPositionError({
        widgetTitle,
        detail: `column must be an integer, received ${String(column)}`,
      }),
    );
  }

  if (!isValidInteger(rowSpan)) {
    errors.push(
      getInvalidPositionError({
        widgetTitle,
        detail: `rowSpan must be an integer, received ${String(rowSpan)}`,
      }),
    );
  }

  if (!isValidInteger(columnSpan)) {
    errors.push(
      getInvalidPositionError({
        widgetTitle,
        detail: `columnSpan must be an integer, received ${String(columnSpan)}`,
      }),
    );
  }

  if (errors.length > 0) {
    return errors;
  }

  if (column >= WIDGET_GRID_MAX_COLUMNS) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `column ${column} exceeds grid width (max column is ${WIDGET_GRID_MAX_COLUMNS - 1})`,
      ),
      userFriendlyMessage: msg`Widget extends beyond grid width`,
    });
  }

  if (column + columnSpan > WIDGET_GRID_MAX_COLUMNS) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `widget extends beyond grid width (column ${column} + columnSpan ${columnSpan} > ${WIDGET_GRID_MAX_COLUMNS})`,
      ),
      userFriendlyMessage: msg`Widget extends beyond grid width`,
    });
  }

  if (row >= WIDGET_GRID_MAX_ROWS) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `row ${row} exceeds maximum allowed rows (${WIDGET_GRID_MAX_ROWS})`,
      ),
      userFriendlyMessage: msg`Widget row exceeds grid height`,
    });
  }

  if (row + rowSpan > WIDGET_GRID_MAX_ROWS) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `widget extends beyond grid height (row ${row} + rowSpan ${rowSpan} > ${WIDGET_GRID_MAX_ROWS})`,
      ),
      userFriendlyMessage: msg`Widget extends beyond grid height`,
    });
  }

  return errors;
};
