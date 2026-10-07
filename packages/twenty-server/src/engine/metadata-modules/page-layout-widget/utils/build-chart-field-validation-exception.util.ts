import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const buildChartFieldValidationException = (
  message: string,
  widgetTitle?: string | null,
): PageLayoutWidgetException => {
  const prefix = isDefined(widgetTitle) ? `Chart "${widgetTitle}": ` : '';
  const fullMessage = prefix + message;

  return new PageLayoutWidgetException(
    fullMessage,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    {
      userFriendlyMessage: msg`${fullMessage}`,
    },
  );
};
