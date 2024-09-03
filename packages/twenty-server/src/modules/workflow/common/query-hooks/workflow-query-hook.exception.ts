import { CustomException } from 'src/utils/custom-exception';

export class WorkflowQueryHookException extends CustomException {
  constructor(message: string, code: WorkflowQueryHookExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowQueryHookExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}
