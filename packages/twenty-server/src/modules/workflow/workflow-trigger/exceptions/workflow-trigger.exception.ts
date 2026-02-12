import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowTriggerExceptionCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_WORKFLOW_TRIGGER = 'INVALID_WORKFLOW_TRIGGER',
  INVALID_WORKFLOW_VERSION = 'INVALID_WORKFLOW_VERSION',
  INVALID_WORKFLOW_STATUS = 'INVALID_WORKFLOW_STATUS',
  INVALID_ACTION_TYPE = 'INVALID_ACTION_TYPE',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

const getWorkflowTriggerExceptionUserFriendlyMessage = (
  code: WorkflowTriggerExceptionCode,
) => {
  switch (code) {
    case WorkflowTriggerExceptionCode.INVALID_INPUT:
      return msg`Invalid workflow trigger input.`;
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER:
      return msg`Invalid workflow trigger configuration.`;
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION:
      return msg`Invalid workflow version.`;
    case WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS:
      return msg`Invalid workflow status.`;
    case WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE:
      return msg`Invalid action type.`;
    case WorkflowTriggerExceptionCode.NOT_FOUND:
      return msg`Workflow not found.`;
    case WorkflowTriggerExceptionCode.FORBIDDEN:
      return msg`You do not have permission to access this workflow.`;
    case WorkflowTriggerExceptionCode.INTERNAL_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class WorkflowTriggerException extends CustomException<WorkflowTriggerExceptionCode> {
  constructor(
    message: string,
    code: WorkflowTriggerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkflowTriggerExceptionUserFriendlyMessage(code),
    });
  }
}
