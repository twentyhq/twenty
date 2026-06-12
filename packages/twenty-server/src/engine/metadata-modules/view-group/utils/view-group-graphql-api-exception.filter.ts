import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { ViewGroupException } from 'src/engine/metadata-modules/view-group/exceptions/view-group.exception';
import { viewGroupGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/view-group/utils/view-group-graphql-api-exception-handler.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

@Catch(ViewGroupException, WorkspaceMigrationBuilderException)
@Injectable()
export class ViewGroupGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(
    exception: ViewGroupException | WorkspaceMigrationBuilderException,
    _host: ExecutionContext,
  ) {
    return viewGroupGraphqlApiExceptionHandler(exception);
  }
}
