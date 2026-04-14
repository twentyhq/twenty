import { toIsoStringOrNull } from 'src/utils/date/toIsoStringOrNull';

describe('toIsoStringOrNull', () => {
  it('should return null for null or undefined', () => {
    expect(toIsoStringOrNull(null)).toBeNull();
    expect(toIsoStringOrNull(undefined)).toBeNull();
  });

  it('should convert Date to ISO string', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');

    expect(toIsoStringOrNull(date)).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should pass through strings unchanged', () => {
    expect(toIsoStringOrNull('2024-01-15T10:30:00.000Z')).toBe(
      '2024-01-15T10:30:00.000Z',
    );
  });

  it('should throw on invalid Date', () => {
    expect(() => toIsoStringOrNull(new Date('invalid'))).toThrow(RangeError);
  });
});
