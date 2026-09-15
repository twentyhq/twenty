import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowStepExecutorExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
  INVALID_STEP_TYPE = 'INVALID_STEP_TYPE',
  INVALID_STEP_INPUT = 'INVALID_STEP_INPUT',
  STEP_NOT_FOUND = 'STEP_NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NO_ACTIVE_WORKFLOW_VERSION = 'NO_ACTIVE_WORKFLOW_VERSION',
  WORKFLOW_RUN_DEPTH_EXCEEDED = 'WORKFLOW_RUN_DEPTH_EXCEEDED',
}

const getWorkflowStepExecutorExceptionUserFriendlyMessage = (
  code: WorkflowStepExecutorExceptionCode,
) => {
  switch (code) {
    case WorkflowStepExecutorExceptionCode.SCOPED_WORKSPACE_NOT_FOUND:
      return msg`Workspace not found.`;
    case WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE:
      return msg`Invalid workflow step type.`;
    case WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND:
      return msg`Workflow step not found.`;
    case WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT:
      return msg`Invalid workflow step input.`;
    case WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION:
      return msg`The selected workflow has no active version.`;
    case WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED:
      return msg`Workflow run depth limit exceeded.`;
    case WorkflowStepExecutorExceptionCode.INTERNAL_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

// Codes that stem from user misconfiguration (bad step input, workflow with
// no active version, a RUN_WORKFLOW loop) rather than an infrastructure
// failure — the executor uses this to skip Sentry reporting and the
// system-error metric for these codes.
export const WORKFLOW_STEP_USER_ERROR_CODES = new Set([
  WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
  WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
  WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
  WorkflowStepExecutorExceptionCode.NO_ACTIVE_WORKFLOW_VERSION,
  WorkflowStepExecutorExceptionCode.WORKFLOW_RUN_DEPTH_EXCEEDED,
]);

export class WorkflowStepExecutorException extends CustomException<WorkflowStepExecutorExceptionCode> {
  constructor(
    message: string,
    code: WorkflowStepExecutorExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkflowStepExecutorExceptionUserFriendlyMessage(code),
    });
  }
}
