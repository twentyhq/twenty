import { convertJsonValueToPostgresJsonbText } from '@/utils/filter/utils/convertJsonValueToPostgresJsonbText';

describe('convertJsonValueToPostgresJsonbText', () => {
  it('should format scalars like Postgres', () => {
    expect(convertJsonValueToPostgresJsonbText('plain')).toBe('"plain"');
    expect(convertJsonValueToPostgresJsonbText(42)).toBe('42');
    expect(convertJsonValueToPostgresJsonbText(true)).toBe('true');
    expect(convertJsonValueToPostgresJsonbText(null)).toBe('null');
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
