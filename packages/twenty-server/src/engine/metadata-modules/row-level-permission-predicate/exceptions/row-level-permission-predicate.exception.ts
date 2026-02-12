/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const RowLevelPermissionPredicateExceptionCode =
  appendCommonExceptionCode({
    ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND:
      'ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND',
    INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA:
      'INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA',
    FIELD_METADATA_NOT_FOUND: 'FIELD_METADATA_NOT_FOUND',
    OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
    ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
    UNAUTHORIZED_ROLE_MODIFICATION: 'UNAUTHORIZED_ROLE_MODIFICATION',
    UNAUTHORIZED_OBJECT_MODIFICATION: 'UNAUTHORIZED_OBJECT_MODIFICATION',
    ROW_LEVEL_PERMISSION_FEATURE_DISABLED:
      'ROW_LEVEL_PERMISSION_FEATURE_DISABLED',
  } as const);

const rowLevelPermissionPredicateExceptionUserFriendlyMessages: Record<
  keyof typeof RowLevelPermissionPredicateExceptionCode,
  MessageDescriptor
> = {
  ROW_LEVEL_PERMISSION_PREDICATE_NOT_FOUND: msg`Row level permission predicate not found.`,
  INVALID_ROW_LEVEL_PERMISSION_PREDICATE_DATA: msg`Invalid row level permission predicate data.`,
  FIELD_METADATA_NOT_FOUND: msg`Field metadata not found.`,
  OBJECT_METADATA_NOT_FOUND: msg`Object metadata not found.`,
  ROLE_NOT_FOUND: msg`Role not found.`,
  UNAUTHORIZED_ROLE_MODIFICATION: msg`Cannot modify predicate belonging to a different role.`,
  UNAUTHORIZED_OBJECT_MODIFICATION: msg`Cannot modify predicate belonging to a different object.`,
  ROW_LEVEL_PERMISSION_FEATURE_DISABLED: msg`Row level permission predicate feature is disabled.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class RowLevelPermissionPredicateException extends CustomException<
  keyof typeof RowLevelPermissionPredicateExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof RowLevelPermissionPredicateExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        rowLevelPermissionPredicateExceptionUserFriendlyMessages[code],
    });
  }
}
