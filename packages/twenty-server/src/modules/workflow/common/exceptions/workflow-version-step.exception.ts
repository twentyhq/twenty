import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionStepException extends CustomException<WorkflowVersionStepExceptionCode> {}

export enum WorkflowVersionStepExceptionCode {
  UNKNOWN = 'UNKNOWN',
  NOT_FOUND = 'NOT_FOUND',
  UNDEFINED = 'UNDEFINED',
  FAILURE = 'FAILURE',
  INVALID = 'INVALID',
}
