import { subUnitFromDateTime } from '@/utils/filter/dates/utils/subUnitFromDateTime';

describe('subUnitFromDateTime', () => {
  const baseDate = new Date('2024-03-15T12:00:00Z');

  it('should subtract seconds', () => {
    const result = subUnitFromDateTime(baseDate, 30, 'SECOND');

    expect(baseDate.getTime() - result.getTime()).toBe(30_000);
  });

  it('should subtract minutes', () => {
    const result = subUnitFromDateTime(baseDate, 5, 'MINUTE');

    expect(baseDate.getTime() - result.getTime()).toBe(5 * 60_000);
  });

  it('should subtract hours', () => {
    const result = subUnitFromDateTime(baseDate, 2, 'HOUR');

    expect(baseDate.getTime() - result.getTime()).toBe(2 * 3_600_000);
  });

  it('should subtract days', () => {
    const result = subUnitFromDateTime(baseDate, 3, 'DAY');

    expect(result.getDate()).toBe(12);
  });

  it('should subtract weeks', () => {
    const result = subUnitFromDateTime(baseDate, 1, 'WEEK');

    expect(result.getDate()).toBe(8);
  });

  it('should subtract months', () => {
    const result = subUnitFromDateTime(baseDate, 2, 'MONTH');

    expect(result.getMonth()).toBe(0); // January
  });

  it('should subtract years', () => {
    const result = subUnitFromDateTime(baseDate, 1, 'YEAR');

    expect(result.getFullYear()).toBe(2023);
  });
});
