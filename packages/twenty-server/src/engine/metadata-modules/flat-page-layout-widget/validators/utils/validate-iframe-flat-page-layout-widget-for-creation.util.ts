import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateIframeConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-configuration-type.util';
import { validateIframeUrl } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-url.util';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateIframeFlatPageLayoutWidgetForCreation = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for iframe widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration is required for iframe widget`,
    });

    return errors;
  }

  const result = validateIframeConfigurationType({
    universalConfiguration,
    widgetTitle,
  });

  if (result.status === 'fail') {
    return [...errors, ...result.errors];
  }

  const { iframeUniversalConfiguration } = result;

  const urlErrors = validateIframeUrl({
    iframeUniversalConfiguration,
    widgetTitle,
  });

  errors.push(...urlErrors);

  return errors;
};
