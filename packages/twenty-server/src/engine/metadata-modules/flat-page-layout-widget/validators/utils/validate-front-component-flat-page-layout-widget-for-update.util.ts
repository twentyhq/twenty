import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateFrontComponentConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-front-component-configuration-type.util';

export const validateFrontComponentFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    return [];
  }

  const configurationTypeErrors = validateFrontComponentConfigurationType({
    universalConfiguration,
    title,
  });

  errors.push(...configurationTypeErrors);

  return errors;
};
