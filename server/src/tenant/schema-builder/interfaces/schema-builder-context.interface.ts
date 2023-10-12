import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

export interface SchemaBuilderContext {
  tableName: string;
  workspaceId: string;
  fields: FieldMetadata[];
}
