import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowRunExceptionCode {
  WORKFLOW_RUN_NOT_FOUND = 'WORKFLOW_RUN_NOT_FOUND',
  WORKFLOW_ROOT_STEP_NOT_FOUND = 'WORKFLOW_ROOT_STEP_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INVALID_INPUT = 'INVALID_INPUT',
  WORKFLOW_RUN_LIMIT_REACHED = 'WORKFLOW_RUN_LIMIT_REACHED',
  WORKFLOW_RUN_INVALID = 'WORKFLOW_RUN_INVALID',
}

const workflowRunExceptionUserFriendlyMessages: Record<
  WorkflowRunExceptionCode,
  MessageDescriptor
> = {
  [WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND]: msg`Workflow run not found.`,
  [WorkflowRunExceptionCode.WORKFLOW_ROOT_STEP_NOT_FOUND]: msg`Workflow root step not found.`,
  [WorkflowRunExceptionCode.INVALID_OPERATION]: msg`Invalid workflow operation.`,
  [WorkflowRunExceptionCode.INVALID_INPUT]: msg`Invalid workflow input.`,
  [WorkflowRunExceptionCode.WORKFLOW_RUN_LIMIT_REACHED]: msg`Workflow run limit reached.`,
  [WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID]: msg`Invalid workflow run.`,
};

export class WorkflowRunException extends CustomException<WorkflowRunExceptionCode> {
  constructor(
    message: string,
    code: WorkflowRunExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? workflowRunExceptionUserFriendlyMessages[code],
    });
  }
}
