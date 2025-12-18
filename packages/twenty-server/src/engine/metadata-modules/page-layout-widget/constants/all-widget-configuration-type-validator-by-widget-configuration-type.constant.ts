import { AggregateChartConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/aggregate-chart-configuration.entity';
import { BarChartConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/bar-chart-configuration.entity';
import { GaugeChartConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/gauge-chart-configuration.entity';
import { IframeConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/iframe-configuration.entity';
import { LineChartConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/line-chart-configuration.entity';
import { PieChartConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/pie-chart-configuration.entity';
import { StandaloneRichTextConfigurationEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/standalone-rich-text-configuration.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationBase } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configurationt-base.type';

export const ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE =
  {
    AGGREGATE_CHART: AggregateChartConfigurationEntity,
    BAR_CHART: BarChartConfigurationEntity,
    GAUGE_CHART: GaugeChartConfigurationEntity,
    IFRAME: IframeConfigurationEntity,
    LINE_CHART: LineChartConfigurationEntity,
    PIE_CHART: PieChartConfigurationEntity,
    STANDALONE_RICH_TEXT: StandaloneRichTextConfigurationEntity,
  } as const satisfies {
    [P in WidgetConfigurationType]: new () => PageLayoutWidgetConfigurationBase;
  };
