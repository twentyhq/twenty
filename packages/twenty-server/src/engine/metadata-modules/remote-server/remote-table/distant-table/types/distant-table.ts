import { type PostgresTableSchemaColumn } from 'src/engine/metadata-modules/remote-server/types/postgres-table-schema-column';

export type DistantTables = {
  [distantTableName: string]: PostgresTableSchemaColumn[];
};
