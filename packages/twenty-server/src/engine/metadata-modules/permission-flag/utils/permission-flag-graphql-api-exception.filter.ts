import {
  Catch,
  type ExceptionFilter,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { PermissionFlagException } from 'src/engine/metadata-modules/permission-flag/permission-flag.exception';
import { permissionFlagGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permission-flag/utils/permission-flag-graphql-api-exception-handler.util';

@Catch(PermissionFlagException)
@Injectable()
export class PermissionFlagGraphqlApiExceptionFilter
  implements ExceptionFilter
{
  catch(exception: PermissionFlagException, _host: ExecutionContext) {
    return permissionFlagGraphqlApiExceptionHandler(exception);
  }
}
