import { type OrderByDirection } from 'twenty-shared/types';

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
  columnDirections?: Partial<Record<string, OrderByDirection>>;
  type?: WorkspaceSchemaIndexType;
  isUnique?: boolean;
  where?: string;
};
