import { DistantTableColumn } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/types/distant-table-column';

export type DistantTables = {
  [tableName: string]: DistantTableColumn[];
};
