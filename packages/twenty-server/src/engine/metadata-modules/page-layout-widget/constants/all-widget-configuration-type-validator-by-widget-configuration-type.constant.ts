import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

export const ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE =
  {
    [WidgetConfigurationType.AGGREGATE_CHART]: AggregateChartConfigurationDTO,
    [WidgetConfigurationType.BAR_CHART]: BarChartConfigurationDTO,
    [WidgetConfigurationType.GAUGE_CHART]: GaugeChartConfigurationDTO,
    [WidgetConfigurationType.IFRAME]: IframeConfigurationDTO,
    [WidgetConfigurationType.LINE_CHART]: LineChartConfigurationDTO,
    [WidgetConfigurationType.PIE_CHART]: PieChartConfigurationDTO,
    [WidgetConfigurationType.STANDALONE_RICH_TEXT]:
      StandaloneRichTextConfigurationDTO,
    // TODO: Remove the partial when we have all the widget configuration types in the backend
  } as const satisfies Partial<{
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  }>;
