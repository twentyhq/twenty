import { stringifySafely } from '../stringifySafely';

describe('stringifySafely', () => {
  it('should stringify a simple object', () => {
    expect(stringifySafely({ foo: 'bar' })).toBe('{"foo":"bar"}');
  });

  it('should stringify an array', () => {
    expect(stringifySafely([1, 2, 3])).toBe('[1,2,3]');
  });

  it('should stringify a string', () => {
    expect(stringifySafely('hello')).toBe('"hello"');
  });

  it('should stringify a number', () => {
    expect(stringifySafely(42)).toBe('42');
  });

  it('should stringify null', () => {
    expect(stringifySafely(null)).toBe('null');
  });

  it('should stringify undefined', () => {
    expect(stringifySafely(undefined)).toBe('undefined');
  });

  it('should stringify a boolean', () => {
    expect(stringifySafely(true)).toBe('true');
    expect(stringifySafely(false)).toBe('false');
  });

  it('should stringify +Infinity', () => {
    expect(stringifySafely(+Infinity)).toBe('Infinity');
  });

  it('should stringify Infinity', () => {
    expect(stringifySafely(Infinity)).toBe('Infinity');
  });

  it('should stringify -Infinity', () => {
    expect(stringifySafely(-Infinity)).toBe('-Infinity');
  });

  it('should stringify NaN', () => {
    expect(stringifySafely(NaN)).toBe('NaN');
  });

  it('should fall back to String() for circular references', () => {
    const circularObj: Record<string, unknown> = { foo: 'bar' };
    circularObj.self = circularObj;

    expect(stringifySafely(circularObj)).toBe('[object Object]');
  });

  it('should fall back to String() for BigInt values', () => {
    const bigIntValue = BigInt(9007199254740991);

    expect(stringifySafely(bigIntValue)).toBe('9007199254740991');
  });

  it('should fall back to String() for functions', () => {
    // eslint-disable-next-line func-style, prefer-arrow/prefer-arrow-functions
    const namedFunction = function myFunction() {
      return 'test';
    };

    expect(stringifySafely(namedFunction)).toBe(namedFunction.toString());
  });

  it('should fall back to String() for arrow functions', () => {
    const arrowFunction = () => 'test';

    expect(stringifySafely(arrowFunction)).toBe(arrowFunction.toString());
  });

  it('should fall back to String() for symbols', () => {
    const symbol = Symbol('testSymbol');

    expect(stringifySafely(symbol)).toBe('Symbol(testSymbol)');
  });

  it('should fall back to String() for symbols without description', () => {
    const symbol = Symbol();

    expect(stringifySafely(symbol)).toBe('Symbol()');
  });
});
