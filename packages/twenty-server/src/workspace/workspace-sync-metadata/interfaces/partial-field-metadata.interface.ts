import { ReflectFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';

export type PartialFieldMetadata = ReflectFieldMetadata[string] & {
  workspaceId: string;
  objectMetadataId?: string;
};
