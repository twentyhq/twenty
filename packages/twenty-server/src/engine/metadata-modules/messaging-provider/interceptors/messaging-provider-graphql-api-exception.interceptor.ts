import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { messagingProviderGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/messaging-provider/utils/messaging-provider-graphql-api-exception-handler.util';

@Injectable()
export class MessagingProviderGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(messagingProviderGraphqlApiExceptionHandler));
  }
}
