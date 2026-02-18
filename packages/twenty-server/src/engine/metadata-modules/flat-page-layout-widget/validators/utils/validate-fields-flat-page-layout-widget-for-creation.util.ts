import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { type ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs } from 'src/engine/metadata-modules/flat-page-layout-widget/services/flat-page-layout-widget-type-validator.service';
import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateFieldsFlatPageLayoutWidgetForCreation = (
  args: ValidateFlatPageLayoutWidgetTypeSpecificitiesForCreationArgs,
): FlatPageLayoutWidgetValidationError[] => {
  const { flatEntityToValidate } = args;
  const { universalConfiguration, title: widgetTitle } = flatEntityToValidate;
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(universalConfiguration)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration is required for fields widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration is required for fields widget`,
    });

    return errors;
  }

  if (
    universalConfiguration.configurationType !== WidgetConfigurationType.FIELDS
  ) {
    const actualString =
      universalConfiguration.configurationType?.toString() ?? 'undefined';

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for fields widget "${widgetTitle}". Expected FIELDS, got ${actualString}`,
      userFriendlyMessage: msg`Invalid configuration type for fields widget`,
      value: universalConfiguration.configurationType,
    });

    return errors;
  }

  const viewId = (
    universalConfiguration as { configurationType: string; viewId?: unknown }
  ).viewId;

  if (isDefined(viewId) && viewId !== null) {
    if (typeof viewId !== 'string' || !uuidValidate(viewId)) {
      errors.push({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: t`Invalid viewId for fields widget "${widgetTitle}". Expected a valid UUID`,
        userFriendlyMessage: msg`Invalid viewId for fields widget`,
        value: viewId,
      });
    }
  }

  return errors;
};
