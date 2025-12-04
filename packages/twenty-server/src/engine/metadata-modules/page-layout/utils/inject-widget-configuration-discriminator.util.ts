import { type WidgetConfigurationInterface } from 'src/engine/metadata-modules/page-layout/dtos/widget-configuration.interface';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout/enums/widget-configuration-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout/enums/widget-type.enum';

type ConfigurationWithDiscriminator = WidgetConfigurationInterface & {
  configurationType: WidgetConfigurationType;
};

export const injectWidgetConfigurationDiscriminator = (
  widgetType: WidgetType,
  configuration: WidgetConfigurationInterface | null,
): ConfigurationWithDiscriminator | null => {
  if (!configuration) {
    return null;
  }

  if (widgetType === WidgetType.IFRAME) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationType.IFRAME_CONFIG,
    } as ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.GRAPH && 'graphType' in configuration) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationType.CHART_CONFIG,
    } as ConfigurationWithDiscriminator;
  }

  return configuration as ConfigurationWithDiscriminator;
};
