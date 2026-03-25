import { addUnitToDateTime } from '@/utils/filter/dates/utils/addUnitToDateTime';

describe('addUnitToDateTime', () => {
  const baseDate = new Date('2024-03-15T12:00:00Z');

  it('should add seconds', () => {
    const result = addUnitToDateTime(baseDate, 30, 'SECOND');

    expect(result.getTime() - baseDate.getTime()).toBe(30_000);
  });

  it('should add minutes', () => {
    const result = addUnitToDateTime(baseDate, 5, 'MINUTE');

    expect(result.getTime() - baseDate.getTime()).toBe(5 * 60_000);
  });

  it('should add hours', () => {
    const result = addUnitToDateTime(baseDate, 2, 'HOUR');

    expect(result.getTime() - baseDate.getTime()).toBe(2 * 3_600_000);
  });

  it('should add days', () => {
    const result = addUnitToDateTime(baseDate, 3, 'DAY');

    expect(result.getDate()).toBe(18);
  });

  it('should add weeks', () => {
    const result = addUnitToDateTime(baseDate, 1, 'WEEK');

    expect(result.getDate()).toBe(22);
  });

  it('should add months', () => {
    const result = addUnitToDateTime(baseDate, 2, 'MONTH');

    expect(result.getMonth()).toBe(4); // May (0-indexed)
  });

  it('should add years', () => {
    const result = addUnitToDateTime(baseDate, 1, 'YEAR');

    expect(result.getFullYear()).toBe(2025);
  });
});
