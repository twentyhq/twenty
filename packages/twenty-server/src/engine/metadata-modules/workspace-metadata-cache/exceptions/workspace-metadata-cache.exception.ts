import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataCacheException extends CustomException {
  constructor(message: string, code: WorkspaceMetadataCacheExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceMetadataCacheExceptionCode {
  OBJECT_METADATA_MAP_NOT_FOUND = 'Object Metadata map not found',
  OBJECT_METADATA_COLLECTION_NOT_FOUND = 'Object Metadata collection not found',
}
