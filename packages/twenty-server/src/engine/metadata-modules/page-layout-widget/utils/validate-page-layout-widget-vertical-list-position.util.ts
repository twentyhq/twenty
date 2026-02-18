import { msg } from '@lingui/core/macro';
import { type PageLayoutWidgetVerticalListPosition } from 'twenty-shared/types';

import {
  PageLayoutWidgetExceptionCode,
  PageLayoutWidgetExceptionMessageKey,
  generatePageLayoutWidgetExceptionMessage,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validatePageLayoutWidgetVerticalListPosition = (
  position: PageLayoutWidgetVerticalListPosition,
  widgetTitle: string,
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (position.index < 0) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `index ${position.index} must be a non-negative integer`,
      ),
      userFriendlyMessage: msg`Widget index must be a non-negative integer`,
    });
  }

  if (!Number.isInteger(position.index)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: generatePageLayoutWidgetExceptionMessage(
        PageLayoutWidgetExceptionMessageKey.INVALID_WIDGET_POSITION,
        widgetTitle,
        undefined,
        `index ${position.index} must be an integer`,
      ),
      userFriendlyMessage: msg`Widget index must be an integer`,
    });
  }

  return errors;
};
