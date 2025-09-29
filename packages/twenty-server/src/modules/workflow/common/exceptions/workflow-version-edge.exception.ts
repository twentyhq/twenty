import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionEdgeException extends CustomException<WorkflowVersionEdgeExceptionCode> {}

export enum WorkflowVersionEdgeExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  INVALID_REQUEST = 'INVALID_REQUEST',
}
