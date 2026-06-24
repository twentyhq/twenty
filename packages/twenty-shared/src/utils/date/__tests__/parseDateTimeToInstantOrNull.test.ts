import { parseDateTimeToInstantOrNull } from '../parseDateTimeToInstantOrNull';

describe('parseDateTimeToInstantOrNull', () => {
  it.each([
    ['2024-01-15T10:30:00Z', '2024-01-15T10:30:00Z'],
    ['2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00Z'],
    ['2024-01-15T10:30:00+02:00', '2024-01-15T08:30:00Z'],
    ['2024-01-15T10:30:00', '2024-01-15T10:30:00Z'],
    ['2024-01-15 10:30:00', '2024-01-15T10:30:00Z'],
    ['2024-01-15 10:30', '2024-01-15T10:30:00Z'],
    ['2024-01-15', '2024-01-15T00:00:00Z'],
    ['20240115', '2024-01-15T00:00:00Z'],
  ])('should normalize %s to the instant %s', (input, expected) => {
    expect(parseDateTimeToInstantOrNull(input)?.toString()).toBe(expected);
  });

  it.each([['2024'], ['2024-01'], ['not-a-date'], [''], ['01/15/2024']])(
    'should return null for the unparseable value %s',
    (input) => {
      expect(parseDateTimeToInstantOrNull(input)).toBeNull();
    },
  );
});
