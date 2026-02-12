import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ViewGroupException } from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { viewGroupGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/view-group/utils/view-group-graphql-api-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

@Catch(ViewGroupException, WorkspaceMigrationBuilderException)
@Injectable()
export class ViewGroupGraphqlApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  catch(
    exception: ViewGroupException | WorkspaceMigrationBuilderException,
    host: ExecutionContext,
  ) {
    const gqlContext = GqlExecutionContext.create(host);
    const ctx = gqlContext.getContext();
    const userLocale = ctx.req?.locale ?? SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(userLocale);

    return viewGroupGraphqlApiExceptionHandler(exception, i18n);
  }
}
