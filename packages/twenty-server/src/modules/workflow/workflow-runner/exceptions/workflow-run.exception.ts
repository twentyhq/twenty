import { CustomException } from 'src/utils/custom-exception';

export class WorkflowRunException extends CustomException {
  code: WorkflowRunExceptionCode;
  constructor(message: string, code: WorkflowRunExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowRunExceptionCode {
  WORKFLOW_RUN_NOT_FOUND = 'WORKFLOW_RUN_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
  INVALID_INPUT = 'INVALID_INPUT',
  WORKFLOW_RUN_LIMIT_REACHED = 'WORKFLOW_RUN_LIMIT_REACHED',
}
