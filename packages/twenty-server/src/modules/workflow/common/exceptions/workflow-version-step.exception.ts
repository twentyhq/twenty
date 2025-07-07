import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionStepException extends CustomException {
  constructor(
    message: string,
    code: WorkflowVersionStepExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}
export enum WorkflowVersionStepExceptionCode {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  UNDEFINED = 'UNDEFINED',
  FAILURE = 'FAILURE',
  INVALID = 'INVALID',
}
