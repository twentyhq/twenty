import { Field, ObjectType } from '@nestjs/graphql';

import { GraphColor } from 'src/modules/dashboard/chart-data/types/graph-color.enum';

@ObjectType('BarChartSeries')
export class BarChartSeriesDTO {
  @Field(() => String)
  key: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => GraphColor, { nullable: true })
  color?: GraphColor;
}
