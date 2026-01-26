import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateFrontComponentConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-front-component-configuration-type.util';
import { type FrontComponentConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/front-component-configuration.dto';

export const validateFrontComponentFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    return [];
  }

  const frontComponentConfiguration =
    configuration as FrontComponentConfigurationDTO;

  const configurationTypeErrors = validateFrontComponentConfigurationType(
    frontComponentConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  return errors;
};
