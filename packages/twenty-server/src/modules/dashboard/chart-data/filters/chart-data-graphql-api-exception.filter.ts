import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

import { ChartDataException } from 'src/modules/dashboard/chart-data/exceptions/chart-data.exception';
import { chartDataGraphqlApiExceptionHandler } from 'src/modules/dashboard/chart-data/utils/chart-data-graphql-api-exception-handler.util';

@Catch(ChartDataException)
export class ChartDataGraphqlApiExceptionFilter implements GqlExceptionFilter {
  catch(exception: ChartDataException, _host: ArgumentsHost) {
    return chartDataGraphqlApiExceptionHandler(exception);
  }
}
