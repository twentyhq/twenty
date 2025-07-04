import { CustomException } from 'src/utils/custom-exception';

export class WorkflowStepExecutorException extends CustomException {
  constructor(
    message: string,
    code: WorkflowStepExecutorExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum WorkflowStepExecutorExceptionCode {
  SCOPED_WORKSPACE_NOT_FOUND = 'SCOPED_WORKSPACE_NOT_FOUND',
  INVALID_STEP_TYPE = 'INVALID_STEP_TYPE',
  STEP_NOT_FOUND = 'STEP_NOT_FOUND',
  INVALID_STEP_SETTINGS = 'INVALID_STEP_SETTINGS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  FAILED_TO_EXECUTE_STEP = 'FAILED_TO_EXECUTE_STEP',
}
