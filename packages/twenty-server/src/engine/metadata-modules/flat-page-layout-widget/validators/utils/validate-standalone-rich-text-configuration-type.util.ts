import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateStandaloneRichTextConfigurationType = (
  configuration: StandaloneRichTextConfigurationDTO,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.configurationType)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration type is required for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration type is required`,
    });

    return errors;
  }

  if (
    configuration.configurationType !==
    WidgetConfigurationType.STANDALONE_RICH_TEXT
  ) {
    const expectedConfigurationType =
      WidgetConfigurationType.STANDALONE_RICH_TEXT;

    const configurationType = configuration.configurationType;

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for standalone rich text widget "${widgetTitle}". Expected ${expectedConfigurationType}, got ${configurationType}`,
      userFriendlyMessage: msg`Invalid configuration type for standalone rich text widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};
