import { FieldMetadataType } from 'twenty-shared/types';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

export interface WorkspaceSchemaColumnDefinitionGenerator<
  T extends FieldMetadataType = FieldMetadataType,
> {
  generateColumnDefinitions(
    fieldMetadata: FlatFieldMetadata<T>,
  ): WorkspaceSchemaColumnDefinition[];
}
