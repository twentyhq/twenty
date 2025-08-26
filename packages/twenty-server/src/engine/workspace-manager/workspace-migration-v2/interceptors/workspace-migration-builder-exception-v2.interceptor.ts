import {
    type CallHandler,
    type ExecutionContext,
    type NestInterceptor,
} from '@nestjs/common';

import { catchError, type Observable } from 'rxjs';

import { workspaceMigrationBuilderExceptionV2Handler } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-exception-v2-handler';

export class WorkspaceMigrationBuilderExceptionV2Interceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next
      .handle()
      .pipe(catchError(workspaceMigrationBuilderExceptionV2Handler));
  }
}
