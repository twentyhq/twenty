import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';

export const sortDistantTables = (table1, table2) => {
  if (
    table1.status === RemoteTableStatus.SYNCED &&
    table2.status === RemoteTableStatus.NOT_SYNCED
  ) {
    return -1;
  }

  if (
    table1.status === RemoteTableStatus.NOT_SYNCED &&
    table2.status === RemoteTableStatus.SYNCED
  ) {
    return 1;
  }

  return table1.name > table2.name ? 1 : -1;
};
