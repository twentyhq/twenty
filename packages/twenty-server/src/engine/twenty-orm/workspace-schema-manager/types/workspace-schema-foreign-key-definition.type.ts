export type WorkspaceSchemaForeignKeyDefinition = {
  tableName: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
};
