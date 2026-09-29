import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum InputAskExceptionCode {
  INPUT_ASK_OBJECT_MISSING = 'INPUT_ASK_OBJECT_MISSING',
  INPUT_ASK_WITHOUT_KEY = 'INPUT_ASK_WITHOUT_KEY',
}

const getInputAskExceptionUserFriendlyMessage = (
  code: InputAskExceptionCode,
) => {
  switch (code) {
    case InputAskExceptionCode.INPUT_ASK_OBJECT_MISSING:
      return msg`This workspace is still being upgraded and cannot wait for an answer yet. Try again in a moment.`;
    case InputAskExceptionCode.INPUT_ASK_WITHOUT_KEY:
      return msg`This request for input cannot be answered.`;
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
