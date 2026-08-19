import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { timelineActivityRuleGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/timeline-activity-rule/utils/timeline-activity-rule-graphql-api-exception-handler.util';

@Injectable()
export class TimelineActivityRuleGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(timelineActivityRuleGraphqlApiExceptionHandler));
  }
}
