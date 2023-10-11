import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

export interface SchemaBuilderContext {
  entityName: string;
  tableName: string;
  workspaceId: string;
  fields: FieldMetadata[];
}
