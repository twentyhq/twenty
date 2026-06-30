import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

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
  catch(
    exception:
      | PageLayoutException
      | PageLayoutTabException
      | PageLayoutWidgetException
      | WorkspaceMigrationBuilderException,
    _host: ExecutionContext,
  ) {
    return pageLayoutGraphqlApiExceptionHandler(exception);
  }
}
