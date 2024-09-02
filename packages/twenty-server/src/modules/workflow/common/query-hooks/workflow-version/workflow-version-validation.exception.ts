import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionValidationException extends CustomException {
  constructor(message: string, code: WorkflowVersionValidationExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowVersionValidationExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}
