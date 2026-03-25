import { throwIfNotDefined } from '@/utils/typeguard/throwIfNotDefined';

describe('throwIfNotDefined', () => {
  it('should not throw for defined values', () => {
    expect(() => throwIfNotDefined('hello', 'myVar')).not.toThrow();
    expect(() => throwIfNotDefined(0, 'myVar')).not.toThrow();
    expect(() => throwIfNotDefined(false, 'myVar')).not.toThrow();
    expect(() => throwIfNotDefined('', 'myVar')).not.toThrow();
  });

  it('should throw for null', () => {
    expect(() => throwIfNotDefined(null, 'myVar')).toThrow(
      'Value must be defined for variable myVar',
    );
  });

  it('should throw for undefined', () => {
    expect(() => throwIfNotDefined(undefined, 'myVar')).toThrow(
      'Value must be defined for variable myVar',
    );
  });
});
