import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type GraphConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/graph-configuration.type';
import { validateBaseGraphFields } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-base-graph-fields.util';
import { validateGraphConfigurationByType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-by-type.util';
import { validateGraphConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-graph-configuration-type.util';

export const validateGraphFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    return [];
  }

  const graphConfiguration = configuration as GraphConfiguration;

  const configurationTypeErrors = validateGraphConfigurationType(
    graphConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  if (configurationTypeErrors.length > 0) {
    return errors;
  }

  const baseFieldErrors = validateBaseGraphFields(graphConfiguration, title);

  errors.push(...baseFieldErrors);

  const typeSpecificErrors = validateGraphConfigurationByType(
    graphConfiguration,
    title,
  );

  errors.push(...typeSpecificErrors);

  return errors;
};
