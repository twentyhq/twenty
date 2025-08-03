import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataCacheException extends CustomException<WorkspaceMetadataCacheExceptionCode> {}

export enum WorkspaceMetadataCacheExceptionCode {
  OBJECT_METADATA_MAP_NOT_FOUND = 'Object Metadata map not found',
  FIELD_METADATA_NOT_FOUND = 'Field Metadata not found',
  FIELD_METADATA_INVALID = 'Field Metadata is invalid',
  OBJECT_METADATA_COLLECTION_NOT_FOUND = 'Object Metadata collection not found',
}
