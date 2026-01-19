import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('BarChartSeries')
export class BarChartSeriesDTO {
  @Field(() => String)
  key: string;

  @Field(() => String, { nullable: true })
  label?: string;
}
