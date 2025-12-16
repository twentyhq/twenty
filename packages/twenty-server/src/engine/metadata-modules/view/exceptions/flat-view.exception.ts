import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FlatViewExceptionCode = appendCommonExceptionCode({
  VIEW_NOT_FOUND: 'VIEW_NOT_FOUND',
  VIEW_ALREADY_EXISTS: 'VIEW_ALREADY_EXISTS',
} as const);

const flatViewExceptionUserFriendlyMessages: Record<
  keyof typeof FlatViewExceptionCode,
  MessageDescriptor
> = {
  VIEW_NOT_FOUND: msg`View not found.`,
  VIEW_ALREADY_EXISTS: msg`View already exists.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class FlatViewException extends CustomException<
  keyof typeof FlatViewExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FlatViewExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? flatViewExceptionUserFriendlyMessages[code],
    });
  }
}
