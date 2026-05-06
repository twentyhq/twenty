import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { objectMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/object-metadata/utils/object-metadata-graphql-api-exception-handler.util';

@Injectable()
export class ObjectMetadataGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(catchError((err) => objectMetadataGraphqlApiExceptionHandler(err)));
  }
}
