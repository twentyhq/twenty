import { FieldMetadataInterface } from './field-metadata.interface';

export interface WorkspaceSchemaBuilderContext {
  workspaceId: string;
  targetTableName: string;
  fieldMetadataCollection: FieldMetadataInterface[];
}
