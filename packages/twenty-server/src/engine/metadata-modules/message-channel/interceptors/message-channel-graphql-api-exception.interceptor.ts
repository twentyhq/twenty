import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { messageChannelGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/message-channel/utils/message-channel-graphql-api-exception-handler.util';

@Injectable()
export class MessageChannelGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(messageChannelGraphqlApiExceptionHandler));
  }
}
