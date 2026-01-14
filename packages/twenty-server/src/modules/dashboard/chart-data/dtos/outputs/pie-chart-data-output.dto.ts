import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { PieChartDataItemDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/pie-chart-data-item.dto';
import { GraphColorMode } from 'src/modules/dashboard/chart-data/types/graph-color-mode.enum';

@ObjectType('PieChartDataOutput')
export class PieChartDataOutputDTO {
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

  @Field(() => GraphColorMode)
  colorMode: GraphColorMode;

  @Field(() => GraphQLJSON, { nullable: true })
  formattedToRawLookup?: Record<string, unknown>;
}
