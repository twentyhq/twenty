import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowStepExecutorExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
  INVALID_STEP_TYPE = 'INVALID_STEP_TYPE',
  STEP_NOT_FOUND = 'STEP_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

const workflowStepExecutorExceptionUserFriendlyMessages: Record<
  WorkflowStepExecutorExceptionCode,
  MessageDescriptor
> = {
  [WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND]: msg`Workspace not found.`,
  [WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE]: msg`Invalid workflow step type.`,
  [WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND]: msg`Workflow step not found.`,
  [WorkflowStepExecutorExceptionCode.INTERNAL_ERROR]: msg`An unexpected workflow error occurred.`,
};

export class WorkflowStepExecutorException extends CustomException<WorkflowStepExecutorExceptionCode> {
  constructor(
    message: string,
    code: WorkflowStepExecutorExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workflowStepExecutorExceptionUserFriendlyMessages[code],
    });
  }
}
