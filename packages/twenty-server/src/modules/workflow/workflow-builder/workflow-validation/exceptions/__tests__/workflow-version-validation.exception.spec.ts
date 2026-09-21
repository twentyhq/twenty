import { i18n } from '@lingui/core';
import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';

const issue = (message: string): WorkflowValidationIssue => ({
  severity: 'error',
  code: 'INVALID_STEP_PARAMS',
  message,
});

// The toast renders the descriptor, so what it will say is what i18n._ returns.
const userMessageOf = (exception: WorkflowVersionValidationException): string =>
  i18n._(exception.userFriendlyMessage);

describe('WorkflowVersionValidationException', () => {
  beforeAll(() => {
    i18n.loadAndActivate({ locale: 'en', messages: {} });
  });

  it('should tell the user why the version cannot be saved', () => {
    const exception = new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION,
      [
        issue(
          'Step "Classify" configuration is invalid - settings.input.questions.0.name: Answer name is required',
        ),
      ],
    );

    expect(userMessageOf(exception)).toContain('cannot be saved');
    expect(userMessageOf(exception)).toContain('Answer name is required');
  });

  it('should tell the user why the version cannot be activated', () => {
    const exception = new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.NON_ACTIVABLE_WORKFLOW_VERSION,
      [issue('Classify step "Classify" has nothing to classify.')],
    );

    expect(userMessageOf(exception)).toContain('not ready to be activated');
    expect(userMessageOf(exception)).toContain('has nothing to classify');
  });

  // A step with a dozen broken fields would otherwise push the first thing to
  // fix off the end of the toast.
  it('should show the first few reasons and count the rest', () => {
    const exception = new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION,
      ['first', 'second', 'third', 'fourth', 'fifth'].map(issue),
    );

    const message = userMessageOf(exception);

    expect(message).toContain('first; second; third');
    expect(message).toContain('(+2 more)');
    expect(message).not.toContain('fourth');
  });

  it('should keep every reason on the exception for the logs', () => {
    const exception = new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.MALFORMED_WORKFLOW_VERSION,
      ['first', 'second', 'third', 'fourth'].map(issue),
    );

    expect(exception.message).toContain('fourth');
    expect(exception.issues).toHaveLength(4);
  });
});
