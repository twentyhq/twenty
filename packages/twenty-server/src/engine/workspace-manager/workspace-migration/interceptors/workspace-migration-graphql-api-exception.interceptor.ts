import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';

import { type Observable, catchError } from 'rxjs';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderGraphqlApiExceptionHandler } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/workspace-migration-builder-graphql-api-exception-handler.util';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
export class WorkspaceMigrationGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof FlatEntityMapsException) {
          switch (error.code) {
            case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
              throw new NotFoundError(error);
            case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
            case FlatEntityMapsExceptionCode.ENTITY_MALFORMED:
            case FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR:
              throw error;
          }
        }

        if (error instanceof WorkspaceMigrationBuilderException) {
          workspaceMigrationBuilderGraphqlApiExceptionHandler(error);
        }

        if (error instanceof WorkspaceMigrationRunnerException) {
          workspaceMigrationRunnerExceptionFormatter(error);
        }

        throw error;
      }),
    );
  }
}
