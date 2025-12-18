import { type WidgetConfigurationInterface } from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

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
    } satisfies ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.GRAPH && 'graphType' in configuration) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationType.CHART_CONFIG,
    } satisfies ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.STANDALONE_RICH_TEXT) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT_CONFIG,
    } satisfies ConfigurationWithDiscriminator;
  }

  return configuration as ConfigurationWithDiscriminator;
};
