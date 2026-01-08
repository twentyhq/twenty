import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { type IframeConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/iframe-configuration.type';
import { validateIframeConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-configuration-type.util';
import { validateIframeUrl } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-iframe-url.util';

export const validateIframeFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    return [];
  }

  const iframeConfiguration = configuration as IframeConfiguration;

  const configurationTypeErrors = validateIframeConfigurationType(
    iframeConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  const urlErrors = validateIframeUrl(iframeConfiguration, title);

  errors.push(...urlErrors);

  return errors;
};
