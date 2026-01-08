import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateStandaloneRichTextBody = (
  configuration: StandaloneRichTextConfigurationDTO,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.body)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body is required for standalone rich text widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body is required for standalone rich text widget`,
    });

    return errors;
  }

  if (
    typeof configuration.body !== 'object' ||
    Array.isArray(configuration.body)
  ) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Body must be an object for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Body must be an object`,
      value: configuration.body,
    });
  }

  return errors;
};
