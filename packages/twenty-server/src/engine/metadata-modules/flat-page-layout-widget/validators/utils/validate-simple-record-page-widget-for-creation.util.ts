import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateSimpleRecordPageWidgetForCreation =
  (expectedConfigurationType: WidgetConfigurationType) =>
  (
    args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
  ): FlatPageLayoutWidgetValidationError[] => {
    const { flatEntityToValidate } = args;
    const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
    const errors: FlatPageLayoutWidgetValidationError[] = [];

    if (!isDefined(universalConfiguration)) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Configuration is required for widget "${widgetTitle}"`,
        userFriendlyMessage: msg`Configuration is required for widget`,
      });

      return errors;
    }

    if (
      universalConfiguration.configurationType !== expectedConfigurationType
    ) {
      const expectedString = expectedConfigurationType.toString();
      const actualString =
        universalConfiguration.configurationType?.toString() ?? 'undefined';

      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Invalid configuration type for widget "${widgetTitle}". Expected ${expectedString}, got ${actualString}`,
        userFriendlyMessage: msg`Invalid configuration type for widget`,
        value: universalConfiguration.configurationType,
      });
    }

    return errors;
  };
