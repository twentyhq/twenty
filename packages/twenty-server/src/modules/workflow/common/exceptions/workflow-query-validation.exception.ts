import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowQueryValidationExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}

const workflowQueryValidationExceptionUserFriendlyMessages: Record<
  WorkflowQueryValidationExceptionCode,
  MessageDescriptor
> = {
  [WorkflowQueryValidationExceptionCode.FORBIDDEN]: msg`You do not have permission to perform this workflow action.`,
};

export class WorkflowQueryValidationException extends CustomException<WorkflowQueryValidationExceptionCode> {
  constructor(
    message: string,
    code: WorkflowQueryValidationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workflowQueryValidationExceptionUserFriendlyMessages[code],
    });
  }
}
