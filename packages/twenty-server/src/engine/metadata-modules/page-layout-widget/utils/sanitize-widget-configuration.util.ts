import { isDefined } from 'twenty-shared/utils';

import { WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-configuration-input-dto-by-type.constant';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { sanitizeWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/sanitize-widget-configuration-by-dto.util';

// The layout editor saves half-configured widgets, so an invalid configuration is cleaned and kept
export const sanitizeWidgetConfiguration = (
  configuration: AllPageLayoutWidgetConfiguration,
): AllPageLayoutWidgetConfiguration => {
  const WidgetConfigurationDto = isDefined(configuration)
    ? WIDGET_CONFIGURATION_INPUT_DTO_BY_TYPE[configuration.configurationType]
    : undefined;

  if (!isDefined(WidgetConfigurationDto)) {
    return configuration;
  }

  return sanitizeWidgetConfigurationByDto({
    DtoClass: WidgetConfigurationDto,
    configuration: { ...configuration },
  }).sanitizedConfiguration;
};
