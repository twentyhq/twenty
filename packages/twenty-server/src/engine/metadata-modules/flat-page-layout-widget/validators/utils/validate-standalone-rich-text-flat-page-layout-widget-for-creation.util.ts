import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { validateStandaloneRichTextBody } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-body.util';
import { validateStandaloneRichTextConfigurationType } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-standalone-rich-text-configuration-type.util';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateStandaloneRichTextFlatPageLayoutWidgetForCreation = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for standalone rich text widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration is required for standalone rich text widget`,
    });

    return errors;
  }

  const result = validateStandaloneRichTextConfigurationType({
    universalConfiguration,
    widgetTitle,
  });

  if (result.status === 'fail') {
    return [...errors, ...result.errors];
  }

  const { standaloneRichTextUniversalConfiguration } = result;

  const bodyErrors = validateStandaloneRichTextBody({
    standaloneRichTextUniversalConfiguration,
    widgetTitle,
  });

  errors.push(...bodyErrors);

  return errors;
};
