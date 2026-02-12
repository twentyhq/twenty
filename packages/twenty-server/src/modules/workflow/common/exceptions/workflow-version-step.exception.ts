import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionStepExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CODE_STEP_FAILURE = 'CODE_STEP_FAILURE',
  AI_AGENT_STEP_FAILURE = 'AI_AGENT_STEP_FAILURE',
}

const getWorkflowVersionStepExceptionUserFriendlyMessage = (
  code: WorkflowVersionStepExceptionCode,
) => {
  switch (code) {
    case WorkflowVersionStepExceptionCode.INVALID_REQUEST:
      return msg`Invalid workflow step request.`;
    case WorkflowVersionStepExceptionCode.NOT_FOUND:
      return msg`Workflow step not found.`;
    case WorkflowVersionStepExceptionCode.CODE_STEP_FAILURE:
      return msg`Code step execution failed.`;
    case WorkflowVersionStepExceptionCode.AI_AGENT_STEP_FAILURE:
      return msg`AI agent step execution failed.`;
    default:
      assertUnreachable(code);
  }
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
        getWorkflowVersionStepExceptionUserFriendlyMessage(code),
    });
  }
}
