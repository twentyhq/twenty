import { Field, Float, ObjectType } from '@nestjs/graphql';

import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';

@ObjectType('PieChartDataItem')
export class PieChartDataItemDTO {
  @Field(() => String)
  id: string;

  @Field(() => Float)
  value: number;

  @Field(() => GraphColor, { nullable: true })
  color?: GraphColor;
}
