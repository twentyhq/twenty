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
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { workspaceMigrationBuilderExceptionV2Formatter } from 'src/engine/workspace-manager/workspace-migration-v2/interceptors/workspace-migration-builder-exception-v2-formatter';

@Injectable()
export class WorkspaceMigrationBuilderGraphqlApiExceptionInterceptor
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
        if (error instanceof WorkspaceMigrationBuilderExceptionV2) {
          workspaceMigrationBuilderExceptionV2Formatter(error, i18n);
        }

        throw error;
      }),
    );
  }
}
