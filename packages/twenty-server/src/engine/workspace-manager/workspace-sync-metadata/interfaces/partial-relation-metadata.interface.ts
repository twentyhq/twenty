import { ReflectRelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-relation-metadata.interface';

export type PartialRelationMetadata = ReflectRelationMetadata & {
  id: string;
  workspaceId: string;
  fromObjectMetadataId: string;
  toObjectMetadataId: string;
  fromFieldMetadataId: string;
  toFieldMetadataId: string;
};
