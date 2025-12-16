import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FlatEntityMapsExceptionCode = appendCommonExceptionCode({
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_MALFORMED: 'ENTITY_MALFORMED',
} as const);

const flatEntityMapsExceptionUserFriendlyMessages: Record<
  keyof typeof FlatEntityMapsExceptionCode,
  MessageDescriptor
> = {
  ENTITY_ALREADY_EXISTS: msg`Entity already exists.`,
  ENTITY_NOT_FOUND: msg`Entity not found.`,
  ENTITY_MALFORMED: msg`Entity data is malformed.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class FlatEntityMapsException extends CustomException<
  keyof typeof FlatEntityMapsExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FlatEntityMapsExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        flatEntityMapsExceptionUserFriendlyMessages[code],
    });
  }
}
