import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { PageLayoutTabException } from 'src/engine/metadata-modules/page-layout-tab/exceptions/page-layout-tab.exception';
import { PageLayoutWidgetException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { PageLayoutException } from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { pageLayoutGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/page-layout/utils/page-layout-graphql-api-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

@Catch(
  PageLayoutException,
  PageLayoutTabException,
  PageLayoutWidgetException,
  WorkspaceMigrationBuilderException,
)
@Injectable()
export class PageLayoutGraphqlApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  catch(
    exception:
      | PageLayoutException
      | PageLayoutTabException
      | PageLayoutWidgetException
      | WorkspaceMigrationBuilderException,
    host: ExecutionContext,
  ) {
    const gqlContext = GqlExecutionContext.create(host);
    const ctx = gqlContext.getContext();
    const userLocale = ctx.req?.locale ?? SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(userLocale);

    return pageLayoutGraphqlApiExceptionHandler(exception, i18n);
  }
}
