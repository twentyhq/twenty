import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { PieChartDataItemDTO } from 'src/modules/dashboard/chart-data/dtos/pie-chart-data-item.dto';

@ObjectType('PieChartData')
export class PieChartDataDTO {
  @Field(() => [PieChartDataItemDTO])
  data: PieChartDataItemDTO[];

  @Field(() => Boolean)
  showLegend: boolean;

  @Field(() => Boolean)
  showDataLabels: boolean;

  @Field(() => Boolean)
  showCenterMetric: boolean;

  @Field(() => Boolean)
  hasTooManyGroups: boolean;

  @Field(() => GraphQLJSON)
  formattedToRawLookup: Record<string, unknown>;
}
