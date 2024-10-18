export interface WorkspaceTableStructure {
  tableSchema: string;
  tableName: string;
  columnName: string;
  dataType: string;
  columnDefault: string;
  isNullable: boolean;
  isUnique: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isArray: boolean;
  onUpdateAction: string;
  onDeleteAction: string;
}

export type WorkspaceTableStructureResult = {
  [P in keyof WorkspaceTableStructure]: string;
};
