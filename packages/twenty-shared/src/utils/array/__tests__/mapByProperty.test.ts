import { mapByProperty } from '@/utils/array/mapByProperty';

describe('mapByProperty', () => {
  it('should extract the specified property from an item', () => {
    const items = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ];

    expect(items.map(mapByProperty('name'))).toEqual(['Alice', 'Bob']);
  });

  it('should extract the id property', () => {
    const items = [{ id: 'a' }, { id: 'b' }];

    expect(items.map(mapByProperty('id'))).toEqual(['a', 'b']);
  });
});
