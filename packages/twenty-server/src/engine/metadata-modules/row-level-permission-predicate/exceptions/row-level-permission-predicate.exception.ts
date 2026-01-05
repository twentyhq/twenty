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
