export interface SchemaBuilderContext {
  entityName: string;
  tableName: string;
  workspaceId: string;
  fieldAliases: Record<string, string>;
}
