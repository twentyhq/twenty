import { FieldMetadataInterface } from '../../../metadata/field-metadata/interfaces/field-metadata.interface';

export interface WorkspaceSchemaBuilderContext {
  workspaceId: string;
  targetTableName: string;
  fieldMetadataCollection: FieldMetadataInterface[];
}
