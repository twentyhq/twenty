import { CustomException } from 'src/utils/custom-exception';

export class WorkflowCommonException extends CustomException {
  constructor(message: string, code: WorkflowCommonExceptionCode) {
    super(message, code);
  }
}

export enum WorkflowCommonExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INVALID_CACHE_VERSION = 'INVALID_CACHE_VERSION',
}
