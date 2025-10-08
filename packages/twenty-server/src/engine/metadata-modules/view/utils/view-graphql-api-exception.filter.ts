import { Catch, type ExceptionFilter } from '@nestjs/common';

import { ViewFieldException } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { ViewFilterGroupException } from 'src/engine/metadata-modules/view-filter-group/exceptions/view-filter-group.exception';
import { ViewFilterException } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { ViewGroupException } from 'src/engine/metadata-modules/view/exceptions/view-group.exception';
import { ViewSortException } from 'src/engine/metadata-modules/view/exceptions/view-sort.exception';
import { ViewException } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { viewGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/view/utils/view-graphql-api-exception-handler.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';

@Catch(
  ViewException,
  ViewFieldException,
  ViewFilterException,
  ViewFilterGroupException,
  ViewGroupException,
  ViewSortException,
  WorkspaceMigrationBuilderExceptionV2,
)
export class ViewGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ViewException
      | ViewFieldException
      | ViewFilterException
      | ViewFilterGroupException
      | ViewGroupException
      | ViewSortException
      | WorkspaceMigrationBuilderExceptionV2,
  ) {
    return viewGraphqlApiExceptionHandler(exception);
  }
}
