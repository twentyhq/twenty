import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class MicrosoftImportDriverException extends CustomException<string> {
  statusCode: number;
  constructor(
    message: string,
    code: string,
    statusCode: number,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`An error occurred during message import`,
    });
    this.statusCode = statusCode;
  }
}
