import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

import { Observable, catchError } from 'rxjs';

import { relationMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/relation-metadata/utils/relation-metadata-graphql-api-exception-handler.util';

export class RelationMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError((err) => relationMetadataGraphqlApiExceptionHandler(err)),
      );
  }
}
