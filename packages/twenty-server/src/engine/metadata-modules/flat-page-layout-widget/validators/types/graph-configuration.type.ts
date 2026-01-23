import { type AggregateChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.validation-schema';
import { type BarChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.validation-schema';
import { type GaugeChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.validation-schema';
import { type LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.validation-schema';
import { type PieChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.validation-schema';

export type GraphConfiguration =
  | BarChartConfigurationValidationSchema
  | LineChartConfigurationValidationSchema
  | PieChartConfigurationValidationSchema
  | AggregateChartConfigurationValidationSchema
  | GaugeChartConfigurationValidationSchema;
