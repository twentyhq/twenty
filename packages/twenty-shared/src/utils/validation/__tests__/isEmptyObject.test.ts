import { isEmptyObject } from '@/utils/validation/isEmptyObject';

describe('isEmptyObject', () => {
  it('should return true for empty object', () => {
    expect(isEmptyObject({})).toBe(true);
  });

  it('should return false for object with properties', () => {
    expect(isEmptyObject({ key: 'value' })).toBe(false);
  });

  it('should return false for object with multiple properties', () => {
    expect(isEmptyObject({ key1: 'value1', key2: 'value2' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isEmptyObject(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isEmptyObject(undefined)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isEmptyObject('test')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isEmptyObject(42)).toBe(false);
  });

  it('should return false for boolean', () => {
    expect(isEmptyObject(true)).toBe(false);
    expect(isEmptyObject(false)).toBe(false);
  });

  it('should return true for empty array (as it has no enumerable keys)', () => {
    expect(isEmptyObject([])).toBe(true);
  });

  it('should return false for non-empty array with enumerable properties', () => {
    const arr = [1, 2, 3];
    expect(isEmptyObject(arr)).toBe(false);
  });

  it('should return false for function', () => {
    expect(isEmptyObject(() => {})).toBe(false);
  });

  it('should return true for Date object (as it has no enumerable keys)', () => {
    expect(isEmptyObject(new Date())).toBe(true);
  });

  it('should return true for object created with Object.create(null)', () => {
    expect(isEmptyObject(Object.create(null))).toBe(true);
  });

  it('should return true for object with inherited properties only', () => {
    const parent = { parentProp: 'value' };
    const child = Object.create(parent);
    expect(isEmptyObject(child)).toBe(true); // Only checks own enumerable properties
  });

  it('should return true for object with non-enumerable properties only', () => {
    const obj = {};
    Object.defineProperty(obj, 'nonEnumerableProp', {
      value: 'test',
      enumerable: false,
    });
    expect(isEmptyObject(obj)).toBe(true); // Object.keys only returns enumerable properties
  });

  it('should return false for array with custom properties', () => {
    const arr: any = [];
    arr.customProp = 'value';
    expect(isEmptyObject(arr)).toBe(false);
  });

  it('should return false for Date object with custom properties', () => {
    const date: any = new Date();
    date.customProp = 'value';
    expect(isEmptyObject(date)).toBe(false);
  });
});
