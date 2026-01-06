import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

type IframeConfiguration = {
  configurationType?: WidgetConfigurationType;
  url?: string;
};

const validateConfigurationType = (
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

const validateUrl = (
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

export const validateIframeFlatPageLayoutWidget = ({
  flatEntityToValidate,
}: GenericValidateFlatPageLayoutWidgetTypeSpecificitiesArgs): FlatPageLayoutWidgetValidationError[] => {
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for iframe widget "${title}"`,
      userFriendlyMessage: msg`Configuration is required for iframe widget`,
    });

    return errors;
  }

  const iframeConfiguration = configuration as IframeConfiguration;

  const configurationTypeErrors = validateConfigurationType(
    iframeConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  const urlErrors = validateUrl(iframeConfiguration, title);

  errors.push(...urlErrors);

  return errors;
};
