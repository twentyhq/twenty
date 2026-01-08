import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutWidgetValidationError } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-validation-error.type';
import { VALID_GRAPH_CONFIGURATION_TYPES } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/constants/valid-graph-configuration-types.constant';
import { type GraphConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/types/graph-configuration.type';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateGraphConfigurationType = (
  configuration: GraphConfiguration,
  widgetTitle: string,
): FlatPageLayoutWidgetValidationError[] => {
  const errors: FlatPageLayoutWidgetValidationError[] = [];

  if (!isDefined(configuration.configurationType)) {
    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Configuration type is required for widget "${widgetTitle}"`,
      userFriendlyMessage: msg`Configuration type is required`,
    });

    return errors;
  }

  const isValidGraphConfigurationType =
    VALID_GRAPH_CONFIGURATION_TYPES.includes(configuration.configurationType);

  if (!isValidGraphConfigurationType) {
    const expectedConfigurationTypes = VALID_GRAPH_CONFIGURATION_TYPES.map(
      (type) => type.toString(),
    ).join(', ');

    const configurationTypeString = configuration.configurationType.toString();

    errors.push({
      code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      message: t`Invalid configuration type for graph widget "${widgetTitle}". Expected one of ${expectedConfigurationTypes}, got ${configurationTypeString}`,
      userFriendlyMessage: msg`Invalid configuration type for graph widget`,
      value: configuration.configurationType,
    });
  }

  return errors;
};
