import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type GqlContextType } from '@nestjs/graphql';

import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { permissionGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/permissions/utils/permission-graphql-api-exception-handler.util';

@Catch(PermissionsException)
export class PermissionsGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: PermissionsException, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() !== 'graphql') {
      throw exception;
    }

    return permissionGraphqlApiExceptionHandler(exception);
  }
}
