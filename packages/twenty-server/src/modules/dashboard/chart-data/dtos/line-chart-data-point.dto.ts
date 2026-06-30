import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('LineChartDataPoint')
export class LineChartDataPointDTO {
  @Field(() => String)
  x: string;

  @Field(() => Float)
  y: number;
}
