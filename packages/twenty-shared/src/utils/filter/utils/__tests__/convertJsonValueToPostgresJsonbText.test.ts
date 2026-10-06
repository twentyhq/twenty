import { convertJsonValueToPostgresJsonbText } from '@/utils/filter/utils/convertJsonValueToPostgresJsonbText';

describe('convertJsonValueToPostgresJsonbText', () => {
  it('should format scalars like Postgres', () => {
    expect(convertJsonValueToPostgresJsonbText('plain')).toBe('"plain"');
    expect(convertJsonValueToPostgresJsonbText(42)).toBe('42');
    expect(convertJsonValueToPostgresJsonbText(true)).toBe('true');
    expect(convertJsonValueToPostgresJsonbText(null)).toBe('null');
  });

  it('should format numbers in decimal notation like Postgres numeric', () => {
    expect(convertJsonValueToPostgresJsonbText(1e21)).toBe(
      '1000000000000000000000',
    );
    expect(convertJsonValueToPostgresJsonbText(1e-7)).toBe('0.0000001');
    expect(convertJsonValueToPostgresJsonbText(-1.5e-7)).toBe('-0.00000015');
    expect(convertJsonValueToPostgresJsonbText(1.2345e22)).toBe(
      '12345000000000000000000',
    );
    expect(convertJsonValueToPostgresJsonbText([1e21])).toBe(
      '[1000000000000000000000]',
    );
  });

  it('should format undefined as null instead of throwing', () => {
    expect(convertJsonValueToPostgresJsonbText(undefined)).toBe('null');
  });

  it('should format empty containers without spaces', () => {
    expect(convertJsonValueToPostgresJsonbText([])).toBe('[]');
    expect(convertJsonValueToPostgresJsonbText({})).toBe('{}');
  });

  it('should sort object keys by byte length then bytes', () => {
    expect(
      convertJsonValueToPostgresJsonbText({
        tags: ['a', 'b'],
        b: 1,
        a: { zz: null, y: 'x' },
        é: 2,
        ab: 3,
      }),
    ).toBe(
      '{"a": {"y": "x", "zz": null}, "b": 1, "ab": 3, "é": 2, "tags": ["a", "b"]}',
    );
  });

  it('should drop undefined properties like the write path does', () => {
    expect(convertJsonValueToPostgresJsonbText({ a: undefined, b: 1 })).toBe(
      '{"b": 1}',
    );
  });
});
