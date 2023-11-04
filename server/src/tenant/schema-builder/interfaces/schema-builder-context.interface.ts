import { FieldMetadataInterface } from './field-metadata.interface';

export interface SchemaBuilderContext {
  workspaceId: string;
  targetTableName: string;
  fieldMetadataCollection: FieldMetadataInterface[];
}
