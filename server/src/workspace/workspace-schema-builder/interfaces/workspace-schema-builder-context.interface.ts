import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

export interface WorkspaceSchemaBuilderContext {
  workspaceId: string;
  targetTableName: string;
  fieldMetadataCollection: FieldMetadataInterface[];
}
