import { removePropertiesFromRecord } from '@/utils/removePropertiesFromRecord';

describe('removePropertiesFromRecord', () => {
  it('should remove specified keys from the record', () => {
    const record = { a: 1, b: 2, c: 3 };

    const result = removePropertiesFromRecord(record, ['b']);

    expect(result).toEqual({ a: 1, c: 3 });
    expect('b' in result).toBe(false);
  });

  it('should remove multiple keys', () => {
    const record = { a: 1, b: 2, c: 3 };

    const result = removePropertiesFromRecord(record, ['a', 'c']);

    expect(result).toEqual({ b: 2 });
  });

  it('should not mutate the original record', () => {
    const record = { a: 1, b: 2 };

    removePropertiesFromRecord(record, ['a']);

    expect(record).toEqual({ a: 1, b: 2 });
  });

  it('should return the same shape when no keys are removed', () => {
    const record = { a: 1, b: 2 };

    const result = removePropertiesFromRecord(record, []);

    expect(result).toEqual({ a: 1, b: 2 });
  });
});
