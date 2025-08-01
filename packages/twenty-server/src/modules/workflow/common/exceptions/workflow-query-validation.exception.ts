import { CustomException } from 'src/utils/custom-exception';

export class WorkflowQueryValidationException extends CustomException<WorkflowQueryValidationExceptionCode> {}

export enum WorkflowQueryValidationExceptionCode {
  FORBIDDEN = 'FORBIDDEN',
}
