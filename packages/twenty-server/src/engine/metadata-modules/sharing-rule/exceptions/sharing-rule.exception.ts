import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const SharingRuleExceptionCode = appendCommonExceptionCode({
  SHARING_RULE_NOT_FOUND: 'SHARING_RULE_NOT_FOUND',
  INVALID_SHARING_RULE_INPUT: 'INVALID_SHARING_RULE_INPUT',
  OBJECT_METADATA_NOT_FOUND: 'OBJECT_METADATA_NOT_FOUND',
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
} as const);

const sharingRuleExceptionUserFriendlyMessages: Record<
  keyof typeof SharingRuleExceptionCode,
  MessageDescriptor
> = {
  SHARING_RULE_NOT_FOUND: msg`Sharing rule not found.`,
  INVALID_SHARING_RULE_INPUT: msg`Invalid sharing rule input.`,
  OBJECT_METADATA_NOT_FOUND: msg`Object metadata not found.`,
  ROLE_NOT_FOUND: msg`Role not found.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class SharingRuleException extends CustomException<
  keyof typeof SharingRuleExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof SharingRuleExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? sharingRuleExceptionUserFriendlyMessages[code],
    });
  }
}
