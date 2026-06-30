import { findByProperty } from '@/utils/array/findByProperty';

describe('findByProperty', () => {
  it('should find item matching the value', () => {
    const items = [
      { id: '1', status: 'active' },
      { id: '2', status: 'inactive' },
    ];

    const result = items.find(findByProperty('status', 'inactive'));

    expect(result).toEqual({ id: '2', status: 'inactive' });
  });

  it('should return undefined when no match exists', () => {
    const items = [{ id: '1', name: 'Alice' }];

    const result = items.find(findByProperty('name', 'Bob'));

    expect(result).toBeUndefined();
  });

  it('should handle null match value', () => {
    const items = [
      { id: '1', name: null as string | null },
      { id: '2', name: 'Bob' },
    ];

    const result = items.find(findByProperty('name', null));

    expect(result).toEqual({ id: '1', name: null });
  });
});
