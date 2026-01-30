import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { BarChartSeriesDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/bar-chart-series.dto';

@ObjectType('BarChartDataOutput')
export class BarChartDataOutputDTO {
  @Field(() => [GraphQLJSON])
  data: Record<string, string | number>[];

  @Field(() => String)
  indexBy: string;

  @Field(() => [String])
  keys: string[];

  @Field(() => [BarChartSeriesDTO])
  series: BarChartSeriesDTO[];

  @Field(() => String)
  xAxisLabel: string;

  @Field(() => String)
  yAxisLabel: string;

  @Field(() => Boolean)
  showLegend: boolean;

  @Field(() => Boolean)
  showDataLabels: boolean;

  @Field(() => BarChartLayout)
  layout: BarChartLayout;

  @Field(() => BarChartGroupMode)
  groupMode: BarChartGroupMode;

  @Field(() => Boolean)
  hasTooManyGroups: boolean;

  @Field(() => GraphQLJSON)
  formattedToRawLookup: Record<string, unknown>;
}
