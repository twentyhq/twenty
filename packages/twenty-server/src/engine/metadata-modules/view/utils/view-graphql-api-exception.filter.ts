import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

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
    _host: ExecutionContext,
  ) {
    return viewGraphqlApiExceptionHandler(exception);
  }
}
