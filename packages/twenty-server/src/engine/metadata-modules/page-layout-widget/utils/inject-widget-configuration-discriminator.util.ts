import { type WidgetConfigurationInterface } from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { WidgetConfigurationTypeDeprecated } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type-deprecated.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

type ConfigurationWithDiscriminator = WidgetConfigurationInterface & {
  configurationType: WidgetConfigurationTypeDeprecated;
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
      configurationType: WidgetConfigurationTypeDeprecated.IFRAME_CONFIG,
    } satisfies ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.GRAPH && 'graphType' in configuration) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationTypeDeprecated.CHART_CONFIG,
    } satisfies ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.STANDALONE_RICH_TEXT) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationTypeDeprecated.STANDALONE_RICH_TEXT_CONFIG,
    } satisfies ConfigurationWithDiscriminator;
  }

  return configuration as ConfigurationWithDiscriminator;
};
