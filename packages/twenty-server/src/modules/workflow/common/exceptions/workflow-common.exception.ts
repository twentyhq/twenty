import { CustomException } from 'src/utils/custom-exception';

export class WorkflowCommonException extends CustomException<WorkflowCommonExceptionCode> {}

export enum WorkflowCommonExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
}
