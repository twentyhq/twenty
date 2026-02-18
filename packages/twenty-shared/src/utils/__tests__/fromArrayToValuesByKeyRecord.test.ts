import { fromArrayToValuesByKeyRecord } from '@/utils/fromArrayToValuesByKeyRecord.util';

describe('fromArrayToValuesByKeyRecord', () => {
  it('should group items by the specified key', () => {
    const array = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
      { name: 'Charlie', role: 'admin' },
    ];

    const result = fromArrayToValuesByKeyRecord({ array, key: 'role' });

    expect(result).toEqual({
      admin: [
        { name: 'Alice', role: 'admin' },
        { name: 'Charlie', role: 'admin' },
      ],
      user: [{ name: 'Bob', role: 'user' }],
    });
  });

  it('should return an empty object for an empty array', () => {
    const result = fromArrayToValuesByKeyRecord({
      array: [] as { name: string }[],
      key: 'name',
    });

    expect(result).toEqual({});
  });

  it('should handle unique keys', () => {
    const array = [
      { name: 'Alice', role: 'admin' },
      { name: 'Bob', role: 'user' },
    ];

    const result = fromArrayToValuesByKeyRecord({ array, key: 'name' });

    expect(result).toEqual({
      Alice: [{ name: 'Alice', role: 'admin' }],
      Bob: [{ name: 'Bob', role: 'user' }],
    });
  });
});
