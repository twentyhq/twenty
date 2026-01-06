import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export type IframeConfiguration = {
  configurationType?: WidgetConfigurationType;
  url?: string;
};

export const validateIframeConfigurationType = (
  configuration: IframeConfiguration,
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

  if (configuration.configurationType !== WidgetConfigurationType.IFRAME) {
    const configurationTypeString = configuration.configurationType.toString();

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for iframe widget "${widgetTitle}". Expected IFRAME, got ${configurationTypeString}`,
      userFriendlyMessage: msg`Invalid configuration type for iframe widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};

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
