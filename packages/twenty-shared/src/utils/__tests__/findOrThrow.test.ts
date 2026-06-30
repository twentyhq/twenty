import { findOrThrow } from '@/utils';

describe('findOrThrow', () => {
  it('returns the element when predicate matches', () => {
    const arr = [1, 2, 3, 4];
    const result = findOrThrow(arr, (x) => x === 3);
    expect(result).toBe(3);
  });

  it('throws default error when no element matches', () => {
    const arr = [1, 2, 3];
    expect(() => findOrThrow(arr, (x) => x === 5)).toThrow(
      new Error('Element not found'),
    );
  });

  it('throws custom error when provided', () => {
    const arr = ['a', 'b', 'c'];
    const customError = new Error('Custom error!');
    expect(() => findOrThrow(arr, (x) => x === 'z', customError)).toThrow(
      customError,
    );
  });

  it('returns the first matching element when multiple match', () => {
    const arr = [2, 4, 6, 8];
    const result = findOrThrow(arr, (x) => x % 2 === 0);
    expect(result).toBe(2);
  });

  it('works with object arrays', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = findOrThrow(arr, (obj) => obj.id === 2);
    expect(result).toEqual({ id: 2 });
  });

  it('works with primitive arrays', () => {
    const arr = ['apple', 'banana', 'cherry'];
    const result = findOrThrow(arr, (fruit) => fruit.startsWith('b'));
    expect(result).toBe('banana');
  });
});
