import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionValidationExceptionCode {
  MALFORMED_WORKFLOW_VERSION = 'MALFORMED_WORKFLOW_VERSION',
  NON_ACTIVABLE_WORKFLOW_VERSION = 'NON_ACTIVABLE_WORKFLOW_VERSION',
}

const getWorkflowVersionValidationExceptionUserFriendlyMessage = (
  code: WorkflowVersionValidationExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION:
      return msg`This workflow version contains malformed data and cannot be saved.`;
    case WorkflowVersionValidationExceptionCode.NON_ACTIVABLE_WORKFLOW_VERSION:
      return msg`This workflow version is not ready to be activated.`;
    default:
      assertUnreachable(code);
  }
};

const describeIssues = (issues: WorkflowValidationIssue[]): string =>
  issues.map((issue) => issue.message).join('; ');

export class WorkflowVersionValidationException extends CustomException<WorkflowVersionValidationExceptionCode> {
  readonly issues: WorkflowValidationIssue[];

  constructor(
    code: WorkflowVersionValidationExceptionCode,
    issues: WorkflowValidationIssue[],
  ) {
    const summary =
      code === WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION
        ? 'Workflow version is malformed'
        : 'Workflow version cannot be activated';

    super(`${summary}: ${describeIssues(issues)}`, code, {
      userFriendlyMessage:
        getWorkflowVersionValidationExceptionUserFriendlyMessage(code),
    });

    this.issues = issues;
  }
}
