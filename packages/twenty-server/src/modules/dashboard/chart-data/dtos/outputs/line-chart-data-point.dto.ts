import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('LineChartDataPoint')
export class LineChartDataPointDTO {
  @Field(() => String)
  x: string;

  @Field(() => Float, { nullable: true })
  y: number | null;
}
