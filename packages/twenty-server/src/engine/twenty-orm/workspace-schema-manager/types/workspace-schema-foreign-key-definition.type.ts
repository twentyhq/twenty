export type WorkspaceSchemaForeignKeyDefinition = {
  name: string;
  columnNames: string[];
  referencedTableName: string;
  referencedColumnNames: string[];
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | 'SET DEFAULT';
};
