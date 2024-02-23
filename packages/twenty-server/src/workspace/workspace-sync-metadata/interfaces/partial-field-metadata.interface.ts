import { ReflectFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';

export type PartialFieldMetadata = Omit<
  ReflectFieldMetadata[string],
  'joinColumn'
> & {
  workspaceId: string;
  objectMetadataId?: string;
};
