import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { LineChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-series.dto';

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

  @Field(() => GraphQLJSON, { nullable: true })
  formattedToRawLookup?: Record<string, unknown>;
}
