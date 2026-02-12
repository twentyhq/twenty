import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { type Observable, catchError } from 'rxjs';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { workspaceMigrationBuilderExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-builder-exception-formatter';
import { workspaceMigrationRunnerExceptionFormatter } from 'src/engine/workspace-manager/workspace-migration/interceptors/workspace-migration-runner-exception-formatter';
import { WorkspaceMigrationRunnerException } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
export class WorkspaceMigrationGraphqlApiExceptionInterceptor
  implements NestInterceptor
{
  constructor(private readonly i18nService: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext();
    const locale = ctx.req?.locale ?? SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(locale);

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
          workspaceMigrationBuilderExceptionFormatter(error, i18n);
        }

        if (error instanceof WorkspaceMigrationRunnerException) {
          workspaceMigrationRunnerExceptionFormatter(error);
        }

        throw error;
      }),
    );
  }
}
