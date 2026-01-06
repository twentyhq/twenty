import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateStandaloneRichTextBody } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-body.util';
import { validateStandaloneRichTextConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-configuration-type.util';
import { type StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';

export const validateStandaloneRichTextFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    return [];
  }

  const standaloneRichTextConfiguration =
    configuration as StandaloneRichTextConfigurationDTO;

  const configurationTypeErrors = validateStandaloneRichTextConfigurationType(
    standaloneRichTextConfiguration,
    title,
  );

  errors.push(...configurationTypeErrors);

  const bodyErrors = validateStandaloneRichTextBody(
    standaloneRichTextConfiguration,
    title,
  );

  errors.push(...bodyErrors);

  return errors;
};
