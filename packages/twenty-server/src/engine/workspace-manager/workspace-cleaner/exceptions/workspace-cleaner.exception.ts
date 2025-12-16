import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkspaceCleanerExceptionCode {
  BILLING_SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
}

const workspaceCleanerExceptionUserFriendlyMessages: Record<
  WorkspaceCleanerExceptionCode,
  MessageDescriptor
> = {
  [WorkspaceCleanerExceptionCode.BILLING_SUBSCRIPTION_NOT_FOUND]: msg`Billing subscription not found.`,
};

export class WorkspaceCleanerException extends CustomException<WorkspaceCleanerExceptionCode> {
  constructor(
    message: string,
    code: WorkspaceCleanerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workspaceCleanerExceptionUserFriendlyMessages[code],
    });
  }
}
