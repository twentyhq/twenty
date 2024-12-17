import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionStepException extends CustomException {
  constructor(message: string, code: WorkflowVersionStepExceptionCode) {
    super(message, code);
  }
}
export enum WorkflowVersionStepExceptionCode {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  UNDEFINED = 'UNDEFINED',
  FAILURE = 'FAILURE',
}
