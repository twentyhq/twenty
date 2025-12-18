import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';
import { AggregateChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/aggregate-chart-configuration.validator';
import { BarChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/bar-chart-configuration.validator';
import { GaugeChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/gauge-chart-configuration.validator';
import { IframeConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/iframe-configuration.validator';
import { LineChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/line-chart-configuration.validator';
import { PieChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/pie-chart-configuration.validator';
import { StandaloneRichTextConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/standalone-rich-text-configuration.validator';

export const ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE =
  {
    [WidgetConfigurationType.AGGREGATE_CHART]:
      AggregateChartConfigurationValidator,
    [WidgetConfigurationType.BAR_CHART]: BarChartConfigurationValidator,
    [WidgetConfigurationType.GAUGE_CHART]: GaugeChartConfigurationValidator,
    [WidgetConfigurationType.IFRAME]: IframeConfigurationValidator,
    [WidgetConfigurationType.LINE_CHART]: LineChartConfigurationValidator,
    [WidgetConfigurationType.PIE_CHART]: PieChartConfigurationValidator,
    [WidgetConfigurationType.STANDALONE_RICH_TEXT]:
      StandaloneRichTextConfigurationValidator,
  } as const satisfies {
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  };
