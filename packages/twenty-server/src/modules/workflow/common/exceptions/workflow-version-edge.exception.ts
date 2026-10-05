import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

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
const WORKFLOW_VERSION_EDGE_EXCEPTION_CATEGORY_BY_CODE = {
  [WorkflowVersionEdgeExceptionCode.NOT_FOUND]: 'NOT_FOUND',
  [WorkflowVersionEdgeExceptionCode.INVALID_REQUEST]: 'BAD_USER_INPUT',
} as const satisfies Record<
  WorkflowVersionEdgeExceptionCode,
  ExceptionCategory
>;

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
      category: WORKFLOW_VERSION_EDGE_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
