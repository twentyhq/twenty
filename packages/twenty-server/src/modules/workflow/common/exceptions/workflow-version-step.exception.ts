import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionStepExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CODE_STEP_FAILURE = 'CODE_STEP_FAILURE',
  AI_AGENT_STEP_FAILURE = 'AI_AGENT_STEP_FAILURE',
}

const workflowVersionStepExceptionUserFriendlyMessages: Record<
  WorkflowVersionStepExceptionCode,
  MessageDescriptor
> = {
  [WorkflowVersionStepExceptionCode.INVALID_REQUEST]: msg`Invalid workflow step request.`,
  [WorkflowVersionStepExceptionCode.NOT_FOUND]: msg`Workflow step not found.`,
  [WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE]: msg`Code step execution failed.`,
  [WorkflowVersionStepExceptionCode.AI_AGENT_STEP_FAILURE]: msg`AI agent step execution failed.`,
};

export class WorkflowVersionStepException extends CustomException<WorkflowVersionStepExceptionCode> {
  constructor(
    message: string,
    code: WorkflowVersionStepExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        workflowVersionStepExceptionUserFriendlyMessages[code],
    });
  }
}
