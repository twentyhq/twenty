import { isEnumValue } from '@/utils/validation/isEnumValue';

enum TestEnum {
  FIRST = 'FIRST',
  SECOND = 'second_value',
}

describe('isEnumValue', () => {
  it('should return true for enum values', () => {
    expect(isEnumValue(TestEnum, 'FIRST')).toBe(true);
    expect(isEnumValue(TestEnum, 'second_value')).toBe(true);
  });

  it('should return false for enum keys that are not values', () => {
    expect(isEnumValue(TestEnum, 'SECOND')).toBe(false);
  });

  it('should return false for values with a different case', () => {
    expect(isEnumValue(TestEnum, 'first')).toBe(false);
  });

  it('should return false for names inherited from Object.prototype', () => {
    expect(isEnumValue(TestEnum, 'constructor')).toBe(false);
    expect(isEnumValue(TestEnum, 'toString')).toBe(false);
    expect(isEnumValue(TestEnum, '__proto__')).toBe(false);
    expect(isEnumValue(TestEnum, 'hasOwnProperty')).toBe(false);
  });

  it('should accept a readonly array of values', () => {
    const values = [TestEnum.FIRST] as const;

    expect(isEnumValue(values, 'FIRST')).toBe(true);
    expect(isEnumValue(values, 'second_value')).toBe(false);
    expect(isEnumValue(values, 'length')).toBe(false);
  });

  it('should return false for non string values', () => {
    expect(isEnumValue(TestEnum, undefined)).toBe(false);
    expect(isEnumValue(TestEnum, null)).toBe(false);
    expect(isEnumValue(TestEnum, 0)).toBe(false);
    expect(isEnumValue(TestEnum, {})).toBe(false);
    expect(isEnumValue(TestEnum, ['FIRST'])).toBe(false);
  });
});
