import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowRunExceptionCode {
  WORKFLOW_RUN_NOT_FOUND = 'WORKFLOW_RUN_NOT_FOUND',
  WORKFLOW_ROOT_STEP_NOT_FOUND = 'WORKFLOW_ROOT_STEP_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INVALID_INPUT = 'INVALID_INPUT',
  WORKFLOW_RUN_LIMIT_REACHED = 'WORKFLOW_RUN_LIMIT_REACHED',
  WORKFLOW_RUN_INVALID = 'WORKFLOW_RUN_INVALID',
}

const getWorkflowRunExceptionUserFriendlyMessage = (
  code: WorkflowRunExceptionCode,
) => {
  switch (code) {
    case WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND:
      return msg`Workflow run not found.`;
    case WorkflowRunExceptionCode.WORKFLOW_ROOT_STEP_NOT_FOUND:
      return msg`Workflow root step not found.`;
    case WorkflowRunExceptionCode.INVALID_OPERATION:
      return msg`Invalid workflow operation.`;
    case WorkflowRunExceptionCode.INVALID_INPUT:
      return msg`Invalid workflow input.`;
    case WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED:
      return msg`Workflow run limit reached.`;
    case WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID:
      return msg`Invalid workflow run.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkflowRunException extends CustomException<WorkflowRunExceptionCode> {
  constructor(
    message: string,
    code: WorkflowRunExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getWorkflowRunExceptionUserFriendlyMessage(code),
    });
  }
}
