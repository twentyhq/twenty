import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionEdgeExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
}

const getWorkflowVersionEdgeExceptionUserFriendlyMessage = (
  code: WorkflowVersionEdgeExceptionCode,
) => {
  switch (code) {
    case WorkflowVersionEdgeExceptionCode.NOT_FOUND:
      return msg`Workflow edge not found.`;
    case WorkflowVersionEdgeExceptionCode.INVALID_REQUEST:
      return msg`Invalid workflow edge request.`;
    default:
      assertUnreachable(code);
  }
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
        getWorkflowVersionEdgeExceptionUserFriendlyMessage(code),
    });
  }
}
