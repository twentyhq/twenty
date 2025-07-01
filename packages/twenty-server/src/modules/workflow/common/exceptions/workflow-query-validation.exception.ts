import { CustomException } from 'src/utils/custom-exception';

export class WorkflowQueryValidationException extends CustomException {
  constructor(
    message: string,
    code: WorkflowQueryValidationExceptionCode,
    { displayedErrorMessage }: { displayedErrorMessage?: string } = {},
  ) {
    super(message, code, displayedErrorMessage);
  }
}

export enum WorkflowQueryValidationExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}
