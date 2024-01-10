export interface WorkspaceTableStructure {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  character_maximum_length: number;
  numeric_precision: number;
  is_nullable: string;
  column_default: string;
  is_primary_key: string;
}
