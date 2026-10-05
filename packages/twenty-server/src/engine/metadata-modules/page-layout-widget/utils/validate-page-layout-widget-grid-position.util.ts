import { msg } from '@lingui/core/macro';
import { type PageLayoutWidgetGridPosition } from 'twenty-shared/types';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import {
  generatePageLayoutWidgetExceptionMessage,
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validatePageLayoutWidgetGridPosition = (
  position: PageLayoutWidgetGridPosition,
  widgetTitle: string,
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const { row, column, rowSpan, columnSpan } = position;

  for (const [property, minimum] of [
    ['row', 0],
    ['column', 0],
    ['rowSpan', 1],
    ['columnSpan', 1],
  ] as const) {
    if (!Number.isInteger(position[property]) || position[property] < minimum) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: generatePageLayoutWidgetExceptionMessage(
          PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
          widgetTitle,
          undefined,
          `${property} must be an integer greater than or equal to ${minimum}`,
        ),
        userFriendlyMessage: msg`Invalid widget position`,
      });
    }
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
