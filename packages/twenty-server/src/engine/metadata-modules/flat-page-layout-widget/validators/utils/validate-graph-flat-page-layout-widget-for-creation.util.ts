import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateBaseGraphFields } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-base-graph-fields.util';
import { validateGraphConfigurationByType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-by-type.util';
import { validateGraphConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-type.util';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateGraphFlatPageLayoutWidgetForCreation = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for graph widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration is required for graph widget`,
    });

    return errors;
  }

  const result = validateGraphConfigurationType({
    universalConfiguration,
    widgetTitle,
  });

  if (result.status === 'fail') {
    return [...errors, ...result.errors];
  }

  const { graphUniversalConfiguration } = result;

  const baseFieldErrors = validateBaseGraphFields({
    graphUniversalConfiguration,
    widgetTitle,
  });

  errors.push(...baseFieldErrors);

  const typeSpecificErrors = validateGraphConfigurationByType({
    graphUniversalConfiguration,
    widgetTitle,
  });

  errors.push(...typeSpecificErrors);

  return errors;
};
