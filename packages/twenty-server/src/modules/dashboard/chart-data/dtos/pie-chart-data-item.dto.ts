import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('PieChartDataItem')
export class PieChartDataItemDTO {
  @Field(() => String)
  key: string;

  @Field(() => Float)
  value: number;
}
