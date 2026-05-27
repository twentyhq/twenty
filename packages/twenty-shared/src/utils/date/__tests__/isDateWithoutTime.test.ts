import { isDateWithoutTime } from '../isDateWithoutTime';

describe('isDateWithoutTime', () => {
  describe('when the string is an ISO 8601 date-only value', () => {
    it('should return true for a standard YYYY-MM-DD date', () => {
      expect(isDateWithoutTime('2022-01-01')).toBe(true);
    });

    it('should return true for the end of a year', () => {
      expect(isDateWithoutTime('2024-12-31')).toBe(true);
    });

    it('should return true for a leap day', () => {
      expect(isDateWithoutTime('2024-02-29')).toBe(true);
    });
  });

  describe('when the string is an ISO 8601 datetime value', () => {
    it('should return false for a datetime with UTC marker', () => {
      expect(isDateWithoutTime('2022-01-01T00:00:00Z')).toBe(false);
    });

    it('should return false for a datetime with milliseconds', () => {
      expect(isDateWithoutTime('2022-01-01T15:30:00.000Z')).toBe(false);
    });

    it('should return false for a datetime with a positive offset', () => {
      expect(isDateWithoutTime('2022-01-01T15:30:00+02:00')).toBe(false);
    });

    it('should return false for a datetime with a negative offset', () => {
      expect(isDateWithoutTime('2022-01-01T15:30:00-05:00')).toBe(false);
    });

    it('should return false for a datetime without a timezone marker', () => {
      expect(isDateWithoutTime('2022-01-01T15:30:00')).toBe(false);
    });
  });

  describe('when the string is malformed or has extra characters', () => {
    it('should return false for an empty string', () => {
      expect(isDateWithoutTime('')).toBe(false);
    });

    it('should return false when the date has surrounding whitespace', () => {
      expect(isDateWithoutTime(' 2022-01-01')).toBe(false);
      expect(isDateWithoutTime('2022-01-01 ')).toBe(false);
    });

    it('should return false for a year-month-only string', () => {
      expect(isDateWithoutTime('2022-01')).toBe(false);
    });

    it('should return false for a year-only string', () => {
      expect(isDateWithoutTime('2022')).toBe(false);
    });

    it('should return false for a non-ISO date format', () => {
      expect(isDateWithoutTime('01/01/2022')).toBe(false);
      expect(isDateWithoutTime('2022/01/01')).toBe(false);
    });
  });
});
