import { parseToInstantOrThrow } from '../parseToInstantOrThrow';

describe('parseToInstantOrThrow', () => {
  it.each([
    ['2024-01-15T10:30:00Z', '2024-01-15T10:30:00Z'],
    ['2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00Z'],
    ['2024-01-15T10:30:00+02:00', '2024-01-15T08:30:00Z'],
    ['2024-01-15T10:30:00', '2024-01-15T10:30:00Z'],
    ['2024-01-15 10:30:00', '2024-01-15T10:30:00Z'],
    ['2024-01-15 10:30', '2024-01-15T10:30:00Z'],
    ['2024-01-15', '2024-01-15T00:00:00Z'],
    ['20240115', '2024-01-15T00:00:00Z'],
  ])('should parse %s to the instant %s', (input, expected) => {
    expect(parseToInstantOrThrow(input).toString()).toBe(expected);
  });

  it.each([['2024'], ['2024-01'], ['not-a-date'], [''], ['01/15/2024']])(
    'should throw for the unparseable value %s',
    (input) => {
      expect(() => parseToInstantOrThrow(input)).toThrow();
    },
  );
});
