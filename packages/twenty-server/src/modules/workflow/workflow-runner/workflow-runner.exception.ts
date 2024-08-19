import { CustomException } from 'src/utils/custom-exception';

export class WorkflowRunnerException extends CustomException {
  constructor(message: string, code: string) {
    super(message, code);
  }
}

export enum WorkflowRunnerExceptionCode {
  WORKFLOW_FAILED = 'WORKFLOW_FAILED',
}
