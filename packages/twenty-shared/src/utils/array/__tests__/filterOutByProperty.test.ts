import { filterOutByProperty } from '@/utils/array/filterOutByProperty';

describe('filterOutByProperty', () => {
  it('should filter out items matching the excluded value', () => {
    const items = [
      { id: '1', status: 'active' },
      { id: '2', status: 'inactive' },
      { id: '3', status: 'active' },
    ];

    const result = items.filter(filterOutByProperty('status', 'inactive'));

    expect(result).toEqual([
      { id: '1', status: 'active' },
      { id: '3', status: 'active' },
    ]);
  });

  it('should keep all items when no match exists', () => {
    const items = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    const result = items.filter(filterOutByProperty('name', 'Charlie'));

    expect(result).toEqual(items);
  });

  it('should handle null exclusion value', () => {
    const items = [
      { id: '1', name: null as string | null },
      { id: '2', name: 'Bob' },
    ];

    const result = items.filter(filterOutByProperty('name', null));

    expect(result).toEqual([{ id: '2', name: 'Bob' }]);
  });
});
