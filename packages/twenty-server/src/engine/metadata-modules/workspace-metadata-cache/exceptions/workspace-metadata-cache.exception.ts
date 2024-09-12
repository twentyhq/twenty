import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataCacheException extends CustomException {
  code: WorkspaceMetadataCacheExceptionCode;
  constructor(message: string, code: WorkspaceMetadataCacheExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceMetadataCacheExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
}
