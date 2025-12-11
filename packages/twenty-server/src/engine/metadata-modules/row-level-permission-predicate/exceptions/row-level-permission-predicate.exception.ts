import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class RowLevelPermissionPredicateException extends CustomException {
  declare code: RowLevelPermissionPredicateExceptionCode;

  constructor(
    message: string,
    code: RowLevelPermissionPredicateExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum RowLevelPermissionPredicateExceptionCode {
  ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND = 'ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND',
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA = 'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

export enum RowLevelPermissionPredicateExceptionMessageKey {
  ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND = 'ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND',
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA = 'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

export const generateRowLevelPermissionPredicateExceptionMessage = (
  key: RowLevelPermissionPredicateExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case RowLevelPermissionPredicateExceptionMessageKey.ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND:
      return `Row level permission predicate${id ? ` (id: ${id})` : ''} not found`;
    case RowLevelPermissionPredicateExceptionMessageKey.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA:
      return `Invalid row level permission predicate data${id ? ` (id: ${id})` : ''}`;
    case RowLevelPermissionPredicateExceptionMessageKey.FIELD_METADATA_NOT_FOUND:
      return 'Field metadata not found';
    case RowLevelPermissionPredicateExceptionMessageKey.OBJECT_METADATA_NOT_FOUND:
      return 'Object metadata not found';
    case RowLevelPermissionPredicateExceptionMessageKey.ROLE_NOT_FOUND:
      return 'Role not found';
    default:
      assertUnreachable(key);
  }
};

export const generateRowLevelPermissionPredicateUserFriendlyExceptionMessage = (
  key: RowLevelPermissionPredicateExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case RowLevelPermissionPredicateExceptionMessageKey.FIELD_METADATA_NOT_FOUND:
      return msg`Field metadata not found`;
    case RowLevelPermissionPredicateExceptionMessageKey.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found`;
    case RowLevelPermissionPredicateExceptionMessageKey.ROLE_NOT_FOUND:
      return msg`Role not found`;
    default:
      return undefined;
  }
};
