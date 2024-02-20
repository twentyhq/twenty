import { ReflectRelationMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-Relation-metadata.interface';

export type PartialRelationMetadata = ReflectRelationMetadata & {
  id: string;
  workspaceId: string;
  fromObjectMetadataId: string;
  toObjectMetadataId: string;
  fromFieldMetadataId: string;
  toFieldMetadataId: string;
};
