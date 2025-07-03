import { CustomException } from 'src/utils/custom-exception';

export class WorkflowQueryValidationException extends CustomException {
  constructor(
    message: string,
    code: WorkflowQueryValidationExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum WorkflowQueryValidationExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}
