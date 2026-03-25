import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { LineChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/line-chart-series.dto';

@ObjectType('LineChartData')
export class LineChartDataDTO {
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
