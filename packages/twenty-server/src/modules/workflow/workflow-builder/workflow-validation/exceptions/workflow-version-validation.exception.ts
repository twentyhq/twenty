import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import { CustomException } from 'src/utils/custom-exception';

export enum WorkflowVersionValidationExceptionCode {
  MALFORMED_WORKFLOW_VERSION = 'MALFORMED_WORKFLOW_VERSION',
  NON_ACTIVABLE_WORKFLOW_VERSION = 'NON_ACTIVABLE_WORKFLOW_VERSION',
}

// More would bury the first thing to fix; the full list stays in the logged message
const MAX_ISSUES_SHOWN_TO_USER = 3;

const describeIssuesForUser = (issues: WorkflowValidationIssue[]): string => {
  const shown = issues
    .slice(0, MAX_ISSUES_SHOWN_TO_USER)
    .map((issue) => issue.message)
    .join('; ');
  const remaining = issues.length - MAX_ISSUES_SHOWN_TO_USER;

  return remaining > 0 ? `${shown} (+${remaining} more)` : shown;
};

// Reasons are interpolated: "malformed" alone leaves someone hunting a field across every step
const getWorkflowVersionValidationExceptionUserFriendlyMessage = (
  code: WorkflowVersionValidationExceptionCode,
  issues: WorkflowValidationIssue[],
): MessageDescriptor => {
  const reasons = describeIssuesForUser(issues);

  switch (code) {
    case WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION:
      return msg`This workflow version cannot be saved. ${reasons}`;
    case WorkflowVersionValidationExceptionCode.NON_ACTIVABLE_WORKFLOW_VERSION:
      return msg`This workflow version is not ready to be activated. ${reasons}`;
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
        getWorkflowVersionValidationExceptionUserFriendlyMessage(code, issues),
    });

    this.issues = issues;
  }
}
