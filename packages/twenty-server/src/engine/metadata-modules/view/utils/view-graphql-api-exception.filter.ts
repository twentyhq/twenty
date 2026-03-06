import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ViewFieldGroupException } from 'src/engine/metadata-modules/view-field-group/exceptions/view-field-group.exception';
import { ViewFieldException } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFilterGroupException } from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { ViewFilterException } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewGroupException } from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { ViewSortException } from 'src/engine/metadata-modules/view-sort/exceptions/view-sort.exception';
import { ViewException } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { viewGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

@Catch(
  ViewException,
  ViewFieldException,
  ViewFilterException,
  ViewFilterGroupException,
  ViewGroupException,
  ViewSortException,
  WorkspaceMigrationBuilderException,
)
@Injectable()
export class ViewGraphqlApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  catch(
    exception:
      | ViewException
      | ViewFieldException
      | ViewFieldGroupException
      | ViewFilterException
      | ViewFilterGroupException
      | ViewGroupException
      | ViewSortException
      | WorkspaceMigrationBuilderException,
    host: ExecutionContext,
  ) {
    const gqlContext = GqlExecutionContext.create(host);
    const ctx = gqlContext.getContext();
    const userLocale = ctx.req?.locale ?? SOURCE_LOCALE;
    const i18n = this.i18nService.getI18nInstance(userLocale);

    return viewGraphqlApiExceptionHandler(exception, i18n);
  }
}
