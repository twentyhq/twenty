import { RemoteTableStatus } from 'src/engine/metadata-modules/remote-server/remote-table/dtos/remote-table.dto';
import { sortDistantTables } from 'src/engine/metadata-modules/remote-server/remote-table/distant-table/utils/sort-distant-tables.util';

const table1 = {
  status: RemoteTableStatus.SYNCED,
  name: 'table1',
};

const table2 = {
  status: RemoteTableStatus.NOT_SYNCED,
  name: 'table2',
};

describe('sortDistantTables', () => {
  it('should return -1 when first param status is SYNCED and second param status is NOT_SYNCED', () => {
    const result = sortDistantTables(table1, table2);

    expect(result).toBe(-1);
  });

  it('should return 1 when first param status is NOT_SYNCED and second param status is SYNCED', () => {
    const result = sortDistantTables(table2, table1);

    expect(result).toBe(1);
  });

  it('should return -1 when same status and first param name is smaller than second param name', () => {
    const result = sortDistantTables(
      { ...table1, status: RemoteTableStatus.NOT_SYNCED },
      table2,
    );

    expect(result).toBe(-1);
  });

  it('should return 1 when same status and second param name is smaller than first param name', () => {
    const result = sortDistantTables(table2, {
      ...table1,
      status: RemoteTableStatus.NOT_SYNCED,
    });

    expect(result).toBe(1);
  });

  it('should be case insensitive', () => {
    const result = sortDistantTables(
      { ...table1, name: 'table1', status: RemoteTableStatus.NOT_SYNCED },
      { ...table2, name: 'Table2' },
    );

    expect(result).toBe(-1);
  });
});
