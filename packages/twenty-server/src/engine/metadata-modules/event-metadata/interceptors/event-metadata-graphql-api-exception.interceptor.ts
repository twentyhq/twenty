import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { eventMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/event-metadata/utils/event-metadata-graphql-api-exception-handler.util';

@Injectable()
export class EventMetadataGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(eventMetadataGraphqlApiExceptionHandler));
  }
}
