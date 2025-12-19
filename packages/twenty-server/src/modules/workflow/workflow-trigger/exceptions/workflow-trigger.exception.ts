import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const workflowTriggerExceptionUserFriendlyMessages: Record<
  WorkflowTriggerExceptionCode,
  MessageDescriptor
> = {
  [WorkflowTriggerExceptionCode.INVALID_INPUT]: msg`Invalid workflow trigger input.`,
  [WorkflowTriggerExceptionCode.INVALID_WORKFLOW_TRIGGER]: msg`Invalid workflow trigger configuration.`,
  [WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION]: msg`Invalid workflow version.`,
  [WorkflowTriggerExceptionCode.INVALID_WORKFLOW_STATUS]: msg`Invalid workflow status.`,
  [WorkflowTriggerExceptionCode.INVALID_ACTION_TYPE]: msg`Invalid action type.`,
  [WorkflowTriggerExceptionCode.NOT_FOUND]: msg`Workflow trigger not found.`,
  [WorkflowTriggerExceptionCode.FORBIDDEN]: msg`You do not have permission to access this workflow.`,
  [WorkflowTriggerExceptionCode.INTERNAL_ERROR]: msg`An unexpected workflow error occurred.`,
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
        workflowTriggerExceptionUserFriendlyMessages[code],
    });
  }
}
