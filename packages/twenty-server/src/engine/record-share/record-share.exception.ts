import { type MessageDescriptor } from '@lingui/core';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum RecordShareExceptionCode {
  INVALID_SHARE_WITH = 'INVALID_SHARE_WITH',
  TRANSACTION_SCOPE_WORKSPACE_MISMATCH = 'TRANSACTION_SCOPE_WORKSPACE_MISMATCH',
}

export class RecordShareException extends CustomException<RecordShareExceptionCode> {
  constructor(
    message: string,
    code: RecordShareExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? STANDARD_ERROR_MESSAGE,
    });
  }
}
