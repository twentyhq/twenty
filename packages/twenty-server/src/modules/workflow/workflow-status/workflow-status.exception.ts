import { CustomException } from 'src/utils/custom-exception';

export class WorkflowStatusException extends CustomException {
  code: WorkflowStatusExceptionCode;
  constructor(message: string, code: WorkflowStatusExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowStatusExceptionCode {
  WORKFLOW_RUN_NOT_FOUND = 'WORKFLOW_RUN_NOT_FOUND',
  INVALID_OPERATION = 'INVALID_OPERATION',
}
