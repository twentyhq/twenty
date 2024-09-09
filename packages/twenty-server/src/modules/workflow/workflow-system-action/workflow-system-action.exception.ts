import { CustomException } from 'src/utils/custom-exception';

export class WorkflowSystemActionException extends CustomException {
  code: WorkflowSystemActionExceptionCode;
  constructor(message: string, code: WorkflowSystemActionExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowSystemActionExceptionCode {
  INVALID_SYSTEM_ACTION_TYPE = 'INVALID_SYSTEM_ACTION_TYPE',
}
