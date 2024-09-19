import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataVersionException extends CustomException {
  code: WorkspaceMetadataVersionExceptionCode;
  constructor(message: string, code: WorkspaceMetadataVersionExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceMetadataVersionExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
}
