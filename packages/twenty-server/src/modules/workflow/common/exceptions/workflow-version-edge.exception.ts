import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionEdgeExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
}

const workflowVersionEdgeExceptionUserFriendlyMessages: Record<
  WorkflowVersionEdgeExceptionCode,
  MessageDescriptor
> = {
  [WorkflowVersionEdgeExceptionCode.NOT_FOUND]: msg`Workflow edge not found.`,
  [WorkflowVersionEdgeExceptionCode.INVALID_REQUEST]: msg`Invalid workflow edge request.`,
};

export class WorkflowVersionEdgeException extends CustomException<WorkflowVersionEdgeExceptionCode> {
  constructor(
    message: string,
    code: WorkflowVersionEdgeExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workflowVersionEdgeExceptionUserFriendlyMessages[code],
    });
  }
}
