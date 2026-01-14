import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { LineChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-series.dto';
import { GraphColorMode } from 'src/modules/dashboard/chart-data/types/graph-color-mode.enum';

@ObjectType('LineChartDataOutput')
export class LineChartDataOutputDTO {
  @Field(() => [LineChartSeriesDTO])
  series: LineChartSeriesDTO[];

  @Field(() => String, { nullable: true })
  xAxisLabel?: string;

  @Field(() => String, { nullable: true })
  yAxisLabel?: string;

  @Field(() => Boolean)
  showLegend: boolean;

  @Field(() => Boolean)
  showDataLabels: boolean;

  @Field(() => Boolean)
  hasTooManyGroups: boolean;

  @Field(() => GraphColorMode)
  colorMode: GraphColorMode;

  @Field(() => GraphQLJSON, { nullable: true })
  formattedToRawLookup?: Record<string, unknown>;
}
