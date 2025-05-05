import { CustomException } from 'src/utils/custom-exception';

export class WorkflowStepExecutorException extends CustomException {
  constructor(message: string, code: WorkflowStepExecutorExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowStepExecutorExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
  INVALID_STEP_TYPE = 'INVALID_STEP_TYPE',
  STEP_NOT_FOUND = 'STEP_NOT_FOUND',
}
