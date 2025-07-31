import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataVersionException extends CustomException<WorkspaceMetadataVersionExceptionCode> {}

export enum WorkspaceMetadataVersionExceptionCode {
  METADATA_VERSION_NOT_FOUND = 'METADATA_VERSION_NOT_FOUND',
}
