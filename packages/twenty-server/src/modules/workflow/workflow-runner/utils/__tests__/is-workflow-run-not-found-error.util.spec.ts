import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { isWorkflowRunNotFoundError } from 'src/modules/workflow/workflow-runner/utils/is-workflow-run-not-found-error.util';

describe('isWorkflowRunNotFoundError', () => {
  it('recognizes a run that no longer exists', () => {
    expect(
      isWorkflowRunNotFoundError(
        new WorkflowRunException(
          'Workflow run not found',
          WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
        ),
      ),
    ).toBe(true);
  });

  it('ignores every other error', () => {
    expect(
      isWorkflowRunNotFoundError(
        new WorkflowRunException(
          'Invalid workflow run',
          WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
        ),
      ),
    ).toBe(false);
    expect(isWorkflowRunNotFoundError(new Error('boom'))).toBe(false);
  });
});
