import { type MessageDescriptor } from '@lingui/core';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const DeferredWorkspaceOperationExceptionCode =
  appendCommonExceptionCode({
    EXECUTION_FAILED: 'EXECUTION_FAILED',
    HANDLER_NOT_FOUND: 'HANDLER_NOT_FOUND',
  } as const);

const getDeferredWorkspaceOperationExceptionUserFriendlyMessage = (
  code: keyof typeof DeferredWorkspaceOperationExceptionCode,
) => {
  switch (code) {
    case DeferredWorkspaceOperationExceptionCode.EXECUTION_FAILED:
    case DeferredWorkspaceOperationExceptionCode.HANDLER_NOT_FOUND:
    case DeferredWorkspaceOperationExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class DeferredWorkspaceOperationException extends CustomException<
  keyof typeof DeferredWorkspaceOperationExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DeferredWorkspaceOperationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getDeferredWorkspaceOperationExceptionUserFriendlyMessage(code),
    });
  }
}
