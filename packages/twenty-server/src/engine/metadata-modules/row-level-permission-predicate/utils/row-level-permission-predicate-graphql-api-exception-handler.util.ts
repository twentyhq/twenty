/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';

export const rowLevelPermissionPredicateGraphqlApiExceptionHandler = (
  error: RowLevelPermissionPredicateException,
) => {
  switch (error.code) {
    case RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED:
    case RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_ROLE_MODIFICATION:
    case RowLevelPermissionPredicateExceptionCode.UNAUTHORIZED_OBJECT_MODIFICATION:
      throw new ForbiddenError(error);
    case RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA:
      throw new UserInputError(error);
    case RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND:
    case RowLevelPermissionPredicateExceptionCode.FIELD_METADATA_NOT_FOUND:
    case RowLevelPermissionPredicateExceptionCode.OBJECT_METADATA_NOT_FOUND:
    case RowLevelPermissionPredicateExceptionCode.ROLE_NOT_FOUND:
      throw new NotFoundError(error);
    case RowLevelPermissionPredicateExceptionCode.INTERNAL_SERVER_ERROR:
      throw new InternalServerError(error);
    default: {
      return assertUnreachable(error.code);
    }
  }
};
