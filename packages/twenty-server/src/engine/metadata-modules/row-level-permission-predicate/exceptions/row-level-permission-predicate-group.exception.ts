import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class RowLevelPermissionPredicateGroupException extends CustomException {
  declare code: RowLevelPermissionPredicateGroupExceptionCode;

  constructor(
    message: string,
    code: RowLevelPermissionPredicateGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum RowLevelPermissionPredicateGroupExceptionCode {
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND = 'ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND',
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA = 'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

export enum RowLevelPermissionPredicateGroupExceptionMessageKey {
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND = 'ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND',
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA = 'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
}

export const generateRowLevelPermissionPredicateGroupExceptionMessage = (
  key: RowLevelPermissionPredicateGroupExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case RowLevelPermissionPredicateGroupExceptionMessageKey.ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND:
      return `Row level permission predicate group${id ? ` (id: ${id})` : ''} not found`;
    case RowLevelPermissionPredicateGroupExceptionMessageKey.INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA:
      return `Invalid row level permission predicate group data${id ? ` (id: ${id})` : ''}`;
    case RowLevelPermissionPredicateGroupExceptionMessageKey.ROLE_NOT_FOUND:
      return 'Role not found';
    default:
      assertUnreachable(key);
  }
};

export const generateRowLevelPermissionPredicateGroupUserFriendlyExceptionMessage =
  (
    key: RowLevelPermissionPredicateGroupExceptionMessageKey,
  ): MessageDescriptor | undefined => {
    switch (key) {
      case RowLevelPermissionPredicateGroupExceptionMessageKey.ROLE_NOT_FOUND:
        return msg`Role not found`;
      default:
        return undefined;
    }
  };
