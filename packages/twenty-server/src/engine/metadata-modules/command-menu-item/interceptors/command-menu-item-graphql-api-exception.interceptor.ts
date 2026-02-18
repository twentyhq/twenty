import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { commandMenuItemGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/command-menu-item/utils/command-menu-item-graphql-api-exception-handler.util';

@Injectable()
export class CommandMenuItemGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(commandMenuItemGraphqlApiExceptionHandler));
  }
}
