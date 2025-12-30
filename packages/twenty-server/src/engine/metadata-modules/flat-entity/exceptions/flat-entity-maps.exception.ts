import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FlatEntityMapsExceptionCode = appendCommonExceptionCode({
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  ENTITY_MALFORMED: 'ENTITY_MALFORMED',
} as const);

const getFlatEntityMapsExceptionUserFriendlyMessage = (
  code: keyof typeof FlatEntityMapsExceptionCode,
) => {
  switch (code) {
    case FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS:
    case FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND:
    case FlatEntityMapsExceptionCode.ENTITY_MALFORMED:
    case FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
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
        getFlatEntityMapsExceptionUserFriendlyMessage(code),
    });
  }
}
