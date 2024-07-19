import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';

import { Observable, catchError } from 'rxjs';

import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';

export class FieldMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => fieldMetadataGraphqlApiExceptionHandler(err)));
  }
}
