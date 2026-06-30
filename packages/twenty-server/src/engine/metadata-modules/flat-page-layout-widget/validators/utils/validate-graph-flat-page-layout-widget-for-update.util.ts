import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateBaseGraphFields } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-base-graph-fields.util';
import { validateGraphConfigurationByType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-by-type.util';
import { validateGraphConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-type.util';

export const validateGraphFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    return [];
  }

  const result = validateGraphConfigurationType({
    universalConfiguration,
    widgetTitle,
  });

  if (result.status === 'fail') {
    return result.errors;
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
