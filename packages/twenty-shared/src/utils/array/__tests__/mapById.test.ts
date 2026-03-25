import { mapById } from '@/utils/array/mapById';

describe('mapById', () => {
  it('should extract the id from an item', () => {
    expect(mapById({ id: 'abc-123' })).toBe('abc-123');
  });

  it('should work with Array.map', () => {
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }];

    expect(items.map(mapById)).toEqual(['1', '2', '3']);
  });
});
