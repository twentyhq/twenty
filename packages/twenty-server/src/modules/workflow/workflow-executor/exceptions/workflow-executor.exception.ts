import { CustomException } from 'src/utils/custom-exception';

export class WorkflowExecutorException extends CustomException {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export enum WorkflowExecutorExceptionCode {
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
  VARIABLE_EVALUATION_FAILED = 'VARIABLE_EVALUATION_FAILED',
}
