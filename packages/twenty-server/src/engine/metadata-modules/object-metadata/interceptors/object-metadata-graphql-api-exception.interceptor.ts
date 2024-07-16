import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

import { Observable, catchError } from 'rxjs';

import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';

export class ObjectMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => objectMetadataGraphqlApiExceptionHandler(err)));
  }
}
