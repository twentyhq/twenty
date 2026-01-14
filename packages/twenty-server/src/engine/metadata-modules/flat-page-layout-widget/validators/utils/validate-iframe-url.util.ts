import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type IframeConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/iframe-configuration.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateIframeUrl = (
  configuration: IframeConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (isDefined(configuration.url) && typeof configuration.url !== 'string') {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`URL must be a string for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`URL must be a string`,
      value: configuration.url,
    });
  }

  return errors;
};
