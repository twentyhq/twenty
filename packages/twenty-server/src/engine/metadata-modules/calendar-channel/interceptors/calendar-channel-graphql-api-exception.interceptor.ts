import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { calendarChannelGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/calendar-channel/utils/calendar-channel-graphql-api-exception-handler.util';

@Injectable()
export class CalendarChannelGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(calendarChannelGraphqlApiExceptionHandler));
  }
}
