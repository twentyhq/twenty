import { CustomException } from 'src/utils/custom-exception';

export class WorkflowActionExecutorException extends CustomException {
  code: WorkflowActionExecutorExceptionCode;
  constructor(message: string, code: WorkflowActionExecutorExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowActionExecutorExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
}
