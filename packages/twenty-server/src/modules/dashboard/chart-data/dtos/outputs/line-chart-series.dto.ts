import { Field, ObjectType } from '@nestjs/graphql';

import { LineChartDataPointDTO } from 'src/modules/dashboard/chart-data/dtos/outputs/line-chart-data-point.dto';

@ObjectType('LineChartSeries')
export class LineChartSeriesDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => [LineChartDataPointDTO])
  data: LineChartDataPointDTO[];
}
