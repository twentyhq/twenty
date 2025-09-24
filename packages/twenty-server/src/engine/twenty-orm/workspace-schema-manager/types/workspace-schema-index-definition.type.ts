export type WorkspaceSchemaIndexType =
  | 'BTREE'
  | 'HASH'
  | 'GIST'
  | 'SPGIST'
  | 'GIN'
  | 'BRIN';

export type WorkspaceSchemaIndexDefinition = {
  name: string;
  columns: string[];
  type?: WorkspaceSchemaIndexType;
  isUnique?: boolean;
  where?: string;
};
