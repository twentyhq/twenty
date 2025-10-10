import { parseJson } from '@/utils/parseJson';

describe('parseJson', () => {
  it('if value is null', () => {
    const result = parseJson(null);
    expect(result).toBeNull();
  });

  it('if value is raw string', () => {
    const result = parseJson('t');
    expect(result).toBeNull();
  });

  it('if value is undefined', () => {
    const result = parseJson(undefined);
    expect(result).toBeNull();
  });

  it('if value is empty string null', () => {
    const result = parseJson('');
    expect(result).toBeNull();
  });

  it('if value is number', () => {
    const result = parseJson(123);
    expect(result).toBe(123);
  });

  it('if value is string', () => {
    const result = parseJson('"mystring"');
    expect(result).toBe('mystring');
  });

  it('if value is an object', () => {
    const result = parseJson('{"name": "John"}');
    expect(result).toEqual({ name: 'John' });
  });

  it('if value is an array', () => {
    const result = parseJson('[1, 2, 3]');
    expect(result).toEqual([1, 2, 3]);
  });

  it('if value is a boolean', () => {
    const result = parseJson(true);
    expect(result).toBe(true);
  });
});
