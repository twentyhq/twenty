import { WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';

export type WorkspaceSchemaTableDefinition = {
  name: string;
  columns: WorkspaceSchemaColumnDefinition[];
};
