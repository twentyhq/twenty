import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

type FrontComponentBuildExceptionCode = 'INVALID_INPUT' | 'BUILD_FAILED';

export class FrontComponentBuildException extends CustomException<FrontComponentBuildExceptionCode> {
  constructor({
    message,
    code,
    userFriendlyMessage,
  }: {
    message: string;
    code: FrontComponentBuildExceptionCode;
    userFriendlyMessage?: MessageDescriptor;
  }) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        (code === 'INVALID_INPUT'
          ? msg`Invalid front component source.`
          : msg`Failed to build front component.`),
    });
    this.name = 'FrontComponentBuildException';
  }
}
