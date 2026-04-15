import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  RowLevelPermissionPredicateException,
  RowLevelPermissionPredicateExceptionCode,
} from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-predicate.exception';
import { rowLevelPermissionPredicateGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/row-level-permission-predicate-graphql-api-exception-handler.util';

describe('rowLevelPermissionPredicateGraphqlApiExceptionHandler', () => {
  it('should throw ForbiddenError for ROW_LEVEL_PERMISSION_FEATURE_DISABLED', () => {
    const exception = new RowLevelPermissionPredicateException(
      'Row level permission predicate feature is disabled.',
      RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_FEATURE_DISABLED,
    );

    expect(() =>
      rowLevelPermissionPredicateGraphqlApiExceptionHandler(exception),
    ).toThrow(ForbiddenError);
  });

  it('should throw NotFoundError for ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND', () => {
    const exception = new RowLevelPermissionPredicateException(
      'Predicate not found',
      RowLevelPermissionPredicateExceptionCode.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND,
    );

    expect(() =>
      rowLevelPermissionPredicateGraphqlApiExceptionHandler(exception),
    ).toThrow(NotFoundError);
  });

  it('should throw UserInputError for INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA', () => {
    const exception = new RowLevelPermissionPredicateException(
      'Invalid data',
      RowLevelPermissionPredicateExceptionCode.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA,
    );

    expect(() =>
      rowLevelPermissionPredicateGraphqlApiExceptionHandler(exception),
    ).toThrow(UserInputError);
  });

  it('should throw InternalServerError for INTERNAL_SERVER_ERROR', () => {
    const exception = new RowLevelPermissionPredicateException(
      'Unexpected',
      RowLevelPermissionPredicateExceptionCode.INTERNAL_SERVER_ERROR,
    );

    expect(() =>
      rowLevelPermissionPredicateGraphqlApiExceptionHandler(exception),
    ).toThrow(InternalServerError);
  });
});
