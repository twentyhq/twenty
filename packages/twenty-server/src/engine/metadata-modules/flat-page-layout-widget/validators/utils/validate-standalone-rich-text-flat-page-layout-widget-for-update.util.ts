import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateStandaloneRichTextBody } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-body.util';
import { validateStandaloneRichTextConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-configuration-type.util';

export const validateStandaloneRichTextFlatPageLayoutWidgetForUpdate = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForUpdateArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    return [];
  }

  const result = validateStandaloneRichTextConfigurationType({
    universalConfiguration,
    widgetTitle,
  });

  if (result.status === 'fail') {
    return result.errors;
  }

  const { standaloneRichTextUniversalConfiguration } = result;

  const bodyErrors = validateStandaloneRichTextBody({
    standaloneRichTextUniversalConfiguration,
    widgetTitle,
  });

  errors.push(...bodyErrors);

  return errors;
};
