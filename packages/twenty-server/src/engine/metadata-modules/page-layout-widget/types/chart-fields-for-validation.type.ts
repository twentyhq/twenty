import { type AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { type GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { type LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { type PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';

export type ChartFieldsForValidation =
  | AggregateChartConfigurationDTO
  | BarChartConfigurationDTO
  | GaugeChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO;
