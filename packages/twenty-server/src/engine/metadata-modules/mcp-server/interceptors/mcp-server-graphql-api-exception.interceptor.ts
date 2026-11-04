import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { mcpServerGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/mcp-server/utils/mcp-server-graphql-api-exception-handler.util';

@Injectable()
export class McpServerGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(catchError(mcpServerGraphqlApiExceptionHandler));
  }
}
