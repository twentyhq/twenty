import { assertIsDefinedOrThrow } from '@/utils';

describe('assertIsDefinedOrThrow', () => {
  it('does not throw when value is defined (number)', () => {
    expect(() => assertIsDefinedOrThrow(42)).not.toThrow();
  });

  it('does not throw when value is defined (false)', () => {
    const v: boolean | undefined | null = false;
    expect(() => assertIsDefinedOrThrow(v)).not.toThrow();
  });

  it('does not throw when value is defined (empty string)', () => {
    const v: string | undefined | null = '';
    expect(() => assertIsDefinedOrThrow(v)).not.toThrow();
  });

  it('throws the default error when value is undefined', () => {
    expect(() => assertIsDefinedOrThrow(undefined)).toThrow(
      'Value not defined',
    );
  });

  it('throws the default error when value is null', () => {
    expect(() => assertIsDefinedOrThrow(null)).toThrow('Value not defined');
  });

  it('throws the custom error instance when provided', () => {
    const err = new TypeError('Custom');
    expect(() => assertIsDefinedOrThrow(undefined, err)).toThrow(err);
  });

  it('narrows the type after assertion (compile-time check)', () => {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function expectString(s: string) {
      expect(typeof s).toBe('string');
    }
    let maybe: string | undefined | null = 'ok';
    assertIsDefinedOrThrow(maybe);
    // After the assertion, TypeScript should treat `maybe` as `string`.
    expectString(maybe);
  });
});
