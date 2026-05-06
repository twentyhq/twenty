import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';

@Injectable()
export class FieldMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => fieldMetadataGraphqlApiExceptionHandler(err)));
  }
}
