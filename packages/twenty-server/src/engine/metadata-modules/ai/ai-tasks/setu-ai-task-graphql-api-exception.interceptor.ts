import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { catchError, type Observable } from 'rxjs';

import { setuAiTaskGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/ai-tasks/utils/setu-ai-task-graphql-api-exception-handler.util';

@Injectable()
export class SetuAiTaskGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(catchError(setuAiTaskGraphqlApiExceptionHandler));
  }
}
