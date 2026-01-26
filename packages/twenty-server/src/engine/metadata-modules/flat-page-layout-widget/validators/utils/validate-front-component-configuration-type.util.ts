import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type FrontComponentConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateFrontComponentConfigurationType = (
  configuration: FrontComponentConfigurationDTO,
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
    configuration.configurationType !== WidgetConfigurationType.FRONT_COMPONENT
  ) {
    const configurationTypeString = String(configuration.configurationType);

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for front component widget "${widgetTitle}". Expected FRONT_COMPONENT, got ${configurationTypeString}`,
      userFriendlyMessage: msg`Invalid configuration type for front component widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};
