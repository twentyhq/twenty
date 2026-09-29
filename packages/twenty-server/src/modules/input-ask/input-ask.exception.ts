import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum InputAskExceptionCode {
  INPUT_ASK_OBJECT_MISSING = 'INPUT_ASK_OBJECT_MISSING',
  ASK_NOT_FOUND = 'ASK_NOT_FOUND',
  ASK_NOT_PENDING = 'ASK_NOT_PENDING',
  INVALID_ASK_RESPONSE = 'INVALID_ASK_RESPONSE',
  ASK_ANSWER_FORBIDDEN = 'ASK_ANSWER_FORBIDDEN',
}

const getInputAskExceptionUserFriendlyMessage = (
  code: InputAskExceptionCode,
) => {
  switch (code) {
    case InputAskExceptionCode.INPUT_ASK_OBJECT_MISSING:
      return msg`This workspace is still being upgraded and cannot wait for an answer yet. Try again in a moment.`;
    case InputAskExceptionCode.ASK_NOT_FOUND:
      return msg`This request for input could not be found.`;
    case InputAskExceptionCode.ASK_NOT_PENDING:
      return msg`This request is no longer waiting for an answer.`;
    case InputAskExceptionCode.INVALID_ASK_RESPONSE:
      return msg`Invalid answer for this request.`;
    case InputAskExceptionCode.ASK_ANSWER_FORBIDDEN:
      return msg`You are not allowed to answer this request.`;
    default:
      assertUnreachable(code);
  }
};

export class InputAskException extends CustomException<InputAskExceptionCode> {
  constructor(
    message: string,
    code: InputAskExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getInputAskExceptionUserFriendlyMessage(code),
    });
  }
}
