import { CustomException } from 'src/utils/custom-exception';

export class WorkflowActionRunnerException extends CustomException {
  code: WorkflowActionRunnerExceptionCode;
  constructor(message: string, code: WorkflowActionRunnerExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowActionRunnerExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
}
