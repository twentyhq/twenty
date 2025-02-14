import { Catch, ExceptionFilter } from '@nestjs/common';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

@Catch(PermissionsException)
export class PermissionsGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: PermissionsException) {
    switch (exception.code) {
      case PermissionsExceptionCode.PERMISSION_DENIED:
      case PermissionsExceptionCode.CANNOT_UNASSIGN_LAST_ADMIN:
        throw new ForbiddenError(exception.message);
      case PermissionsExceptionCode.ROLE_NOT_FOUND:
      case PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND:
        throw new NotFoundError(exception.message);
      default:
        throw new InternalServerError(exception.message);
    }
  }
}
