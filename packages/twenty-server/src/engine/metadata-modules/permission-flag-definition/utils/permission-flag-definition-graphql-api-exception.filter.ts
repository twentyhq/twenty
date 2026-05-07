import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { PermissionFlagDefinitionException } from 'src/engine/metadata-modules/permission-flag-definition/permission-flag-definition.exception';
import { permissionFlagDefinitionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permission-flag-definition/utils/permission-flag-definition-graphql-api-exception-handler.util';

@Catch(PermissionFlagDefinitionException)
@Injectable()
export class PermissionFlagDefinitionGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: PermissionFlagDefinitionException, _host: ExecutionContext) {
    return permissionFlagDefinitionGraphqlApiExceptionHandler(exception);
  }
}
