/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const RowLevelPermissionRuleExceptionCode = appendCommonExceptionCode({
  ROW_LEVEL_PERMISSION_RULE_NOT_FOUND: 'ROW_LEVEL_PERMISSION_RULE_NOT_FOUND',
  INVALID_ROW_LEVEL_PERMISSION_RULE_DATA:
    'INVALID_ROW_LEVEL_PERMISSION_RULE_DATA',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
} as const);

const rowLevelPermissionRuleExceptionUserFriendlyMessages: Record<
  keyof typeof RowLevelPermissionRuleExceptionCode,
  MessageDescriptor
> = {
  ROW_LEVEL_PERMISSION_RULE_NOT_FOUND: msg`Row level permission rule not found.`,
  INVALID_ROW_LEVEL_PERMISSION_RULE_DATA: msg`Invalid row level permission rule data.`,
  ROLE_NOT_FOUND: msg`Role not found.`,
  OBJECT_METADATA_NOT_FOUND: msg`Object metadata not found.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class RowLevelPermissionRuleException extends CustomException<
  keyof typeof RowLevelPermissionRuleExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof RowLevelPermissionRuleExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        rowLevelPermissionRuleExceptionUserFriendlyMessages[code],
    });
  }
}
