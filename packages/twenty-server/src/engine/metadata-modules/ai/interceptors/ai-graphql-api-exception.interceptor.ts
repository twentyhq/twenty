import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { aiGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/ai/utils/ai-graphql-api-exception-handler.util';

@Injectable()
export class AiGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(catchError(aiGraphqlApiExceptionHandler));
  }
}
