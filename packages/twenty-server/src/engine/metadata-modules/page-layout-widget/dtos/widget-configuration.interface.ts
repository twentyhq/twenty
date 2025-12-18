import { createUnionType } from '@nestjs/graphql';

import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetConfigurationTypeDeprecated } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type-deprecated.enum';

export const WidgetConfiguration = createUnionType({
  name: 'WidgetConfiguration',
  types: () => [
    BarChartConfigurationDTO,
    LineChartConfigurationDTO,
    PieChartConfigurationDTO,
    AggregateChartConfigurationDTO,
    GaugeChartConfigurationDTO,
    IframeConfigurationDTO,
    StandaloneRichTextConfigurationDTO,
  ],
  resolveType(configuration: Record<string, unknown>) {
    if (!('configurationType' in configuration)) {
      throw new Error(
        'Widget configuration missing configurationType discriminator. This indicates a validation bug or data corruption.',
      );
    }

    if (
      configuration.configurationType === WidgetConfigurationTypeDeprecated.CHART_CONFIG
    ) {
      switch (configuration.graphType) {
        case GraphType.VERTICAL_BAR:
        case GraphType.HORIZONTAL_BAR:
          return BarChartConfigurationDTO;
        case GraphType.LINE:
          return LineChartConfigurationDTO;
        case GraphType.PIE:
          return PieChartConfigurationDTO;
        case GraphType.AGGREGATE:
          return AggregateChartConfigurationDTO;
        case GraphType.GAUGE:
          return GaugeChartConfigurationDTO;
        default:
          throw new Error(`Unknown graph type: ${configuration.graphType}`);
      }
    }

    if (
      configuration.configurationType === WidgetConfigurationTypeDeprecated.IFRAME_CONFIG
    ) {
      return IframeConfigurationDTO;
    }

    if (
      configuration.configurationType ===
      WidgetConfigurationTypeDeprecated.STANDALONE_RICH_TEXT_CONFIG
    ) {
      return StandaloneRichTextConfigurationDTO;
    }

    throw new Error(
      `Unknown widget configuration type: ${configuration.configurationType}`,
    );
  },
});

export type WidgetConfigurationInterface =
  | BarChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO
  | AggregateChartConfigurationDTO
  | GaugeChartConfigurationDTO
  | IframeConfigurationDTO
  | StandaloneRichTextConfigurationDTO;
