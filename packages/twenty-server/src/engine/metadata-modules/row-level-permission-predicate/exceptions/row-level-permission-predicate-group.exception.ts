/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const RowLevelPermissionPredicateGroupExceptionCode =
  appendCommonExceptionCode({
    ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND:
      'ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND',
    INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA:
      'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA',
    ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  } as const);

const rowLevelPermissionPredicateGroupExceptionUserFriendlyMessages: Record<
  keyof typeof RowLevelPermissionPredicateGroupExceptionCode,
  MessageDescriptor
> = {
  ROW_LEVEL_PERMISSION_PREDICATE_GROUP_NOT_FOUND: msg`Row level permission predicate group not found.`,
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_DATA: msg`Invalid row level permission predicate group data.`,
  ROLE_NOT_FOUND: msg`Role not found.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class RowLevelPermissionPredicateGroupException extends CustomException<
  keyof typeof RowLevelPermissionPredicateGroupExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof RowLevelPermissionPredicateGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        rowLevelPermissionPredicateGroupExceptionUserFriendlyMessages[code],
    });
  }
}
