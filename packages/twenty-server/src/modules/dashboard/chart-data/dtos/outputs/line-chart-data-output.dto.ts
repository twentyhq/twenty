import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { LineChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-series.dto';

@ObjectType('LineChartDataOutput')
export class LineChartDataOutputDTO {
  @Field(() => [LineChartSeriesDTO])
  series: LineChartSeriesDTO[];

  @Field(() => String)
  xAxisLabel: string;

  @Field(() => String)
  yAxisLabel: string;

  @Field(() => Boolean)
  showLegend: boolean;

  @Field(() => Boolean)
  showDataLabels: boolean;

  @Field(() => Boolean)
  hasTooManyGroups: boolean;

  @Field(() => GraphQLJSON)
  formattedToRawLookup: Record<string, unknown>;
}
