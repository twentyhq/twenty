import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { logicFunctionDependenciesSizeGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/logic-function-dependencies-size-graphql-api-exception-handler.util';

@Injectable()
export class WorkspaceMigrationGraphqlApiExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (
          error instanceof LogicFunctionException &&
          error.code ===
            LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED
        ) {
          logicFunctionDependenciesSizeGraphqlApiExceptionHandler(error);
        }

        throw error;
      }),
    );
  }
}
