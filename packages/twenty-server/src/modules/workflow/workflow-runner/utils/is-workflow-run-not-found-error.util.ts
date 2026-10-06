import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

export const isWorkflowRunNotFoundError = (error: unknown): boolean =>
  error instanceof WorkflowRunException &&
  error.code === WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND;
