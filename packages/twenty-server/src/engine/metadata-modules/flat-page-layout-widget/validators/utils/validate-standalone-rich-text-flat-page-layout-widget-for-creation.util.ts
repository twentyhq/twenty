import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateStandaloneRichTextBody } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-body.util';
import { validateStandaloneRichTextConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-configuration-type.util';
import { type StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateStandaloneRichTextFlatPageLayoutWidgetForCreation = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { configuration, title } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for standalone rich text widget "${title}"`,
      userFriendlyMessage: msg`Configuration is required for standalone rich text widget`,
    });

    return errors;
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
