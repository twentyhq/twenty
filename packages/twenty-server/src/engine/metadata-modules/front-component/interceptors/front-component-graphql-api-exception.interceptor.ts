import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { frontComponentGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/front-component/utils/front-component-graphql-api-exception-handler.util';

@Injectable()
export class FrontComponentGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(frontComponentGraphqlApiExceptionHandler));
  }
}
