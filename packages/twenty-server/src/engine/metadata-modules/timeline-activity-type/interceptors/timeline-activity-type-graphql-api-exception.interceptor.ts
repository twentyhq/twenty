import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { type Observable, catchError } from 'rxjs';

import { timelineActivityTypeGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/timeline-activity-type/utils/timeline-activity-type-graphql-api-exception-handler.util';

@Injectable()
export class TimelineActivityTypeGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(timelineActivityTypeGraphqlApiExceptionHandler));
  }
}
